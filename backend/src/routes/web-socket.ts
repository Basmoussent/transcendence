import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebSocket } from 'ws';
import { validateToken } from '../utils/validation';
import { redis } from '../index';

import { ws_matchmaking } from './web_socket/ws_matchmaking'
// import { ws_room } from './web_socket/ws_room'
// import { ws_chat } from './web_socket/ws_chat'

interface User {
	username: string;
	isReady: boolean;
	socket: WebSocket;
}

interface UserChat {
	username: string;
	userId: number;
	email: string;
	avatar_url?: string;
	socket: WebSocket;
}

interface UserData {
	id: number;
	username: string;
	email: string;
	avatar_url?: string;
	language: string;
}

interface Room {
	id: string;
	name: string;
	gameType: 'Pong' | 'Block';
	maxPlayers: number;
	users: Map<string, User>;
	host: string;
	isGameStarted: boolean;
	ai: number;
}

// redeinition on peut import de web-socket.ts
interface Relation {
	id: number | -1;
	user_1: number;
	user_2: number;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked';
}


const rooms = new Map<string, Room>();
const live = new Map<string, UserChat>();
const matchmaking = new Array<WebSocket>();


async function webSocketRoutes(app: FastifyInstance) {

	app.get('/matchmaking', { websocket: true }, (socket: any, req: FastifyRequest) => {
		// Vérification du token
		const token = req.headers['x-access-token'] ? req.headers['x-access-token'] : req.cookies['x-access-token']; 
		
		if (!token) {
			console.log('⚠️  Aucun token fourni. Détails de la requête :');
			console.log('Headers :', JSON.stringify(req.headers, null, 2));
			console.log('Cookies :', JSON.stringify(req.cookies, null, 2));
			socket.send(JSON.stringify({
				type: 'notLog',
				message: 'the user is not log' }))
			return ;
		}

		matchmaking.push(socket);
		console.log("a user just connected on /matchmaking");
		socket.on('message', (message: any) => {
			try {
				const data = JSON.parse(message.toString());
				
				switch (data.type) {
					case 'updateUI':
						broadcastMatchmaking(data);
						break;
					default:
						console.log(`l'event existe pas`)
				}
			}
			catch (error) {
				console.error('Invalid message format:', error);
			}
		});
		socket.on('close', () => {
			const id = matchmaking.findIndex(user => user === socket);
			matchmaking.splice(id, 1);

			console.log(`user left matchmaking`)
		});
	});

	app.get('/room/:uuid', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {

		const token = req.headers['x-access-token'] ? req.headers['x-access-token'] : req.cookies['x-access-token']; 
		
		if (!token) {

			console.log('⚠️  Aucun token fourni. Détails de la requête :');
			console.log('Headers :', JSON.stringify(req.headers, null, 2));
			console.log('Cookies :', JSON.stringify(req.cookies, null, 2));
			socket.send(JSON.stringify({
				type: 'notLog',
				message: 'the user is not log' }))
			return ;
		}

		const decoded = app.jwt.verify(token) as { user: string; name: string };
		const username = decoded.name;

		const { uuid } = req.params as { uuid: string };

		let room = rooms.get(uuid);

		if (!room) {
			room = {
				id: uuid,
				name: `Room ${uuid.substring(0, 5)}`,
				gameType: 'Pong',
				maxPlayers: 4,
				users: new Map(),
				host: username,
				isGameStarted: false,
				ai: 0,
			};

			rooms.set(uuid!, room);
		}

		if (room.users.size >= room.maxPlayers + room.ai) {
			socket.send(JSON.stringify({
				type: 'error',
				message: 'Room is full' }));
				console.log('je vais close le socket')
			socket.close();
			return;
		}

		const user: User = {
			username: username,
			isReady: false, 
			socket: socket };

		room.users.set(username, user);

		console.log(`${username} connected to room ${uuid!}`);
		broadcastSystemMessage(room, `${username} has joined the room.`);
		broadcastRoomUpdate(room);

		socket.on('message', (message: string) => {
			try {
				const data = JSON.parse(message);
				
				const currentRoom = rooms.get(uuid!)!;
				const currentUser = currentRoom.users.get(username)!;

				console.log()

				switch (data.type) {
					case 'toggle_ready':
						currentUser.isReady = !currentUser.isReady;
						console.log(`${username} --> isready == ${currentUser.isReady}`);
						broadcastRoomUpdate(currentRoom);
						break;

					case 'game_type':
						currentRoom.gameType === 'Pong' ? currentRoom.gameType = 'Block' : currentRoom.gameType = 'Pong';
						currentRoom.ai = 0;
						broadcastRoomUpdate(currentRoom);
						break;

					case 'increase':
						currentRoom.ai += 1;
						console.log(currentRoom.ai)
						broadcastRoomUpdate(currentRoom);
						break;
					
					case 'decrease':
						currentRoom.ai -= 1;
						console.log(currentRoom.ai)
						broadcastRoomUpdate(currentRoom);
						break;

					case 'chat_message':
						const chatMessage = JSON.stringify({ 
							type: 'chat_message', 
							username: username,
							content: data.content });
						
						currentRoom.users.forEach(u => {
							// check que le socket du joueur est bien ouvert
							if (u.socket.readyState === WebSocket.OPEN)
								u.socket.send(chatMessage);
						});
						break;

					case 'start_game':
						if (currentRoom.host !== username || currentRoom.users.size < 2)
							return;

						const allReady = Array.from(currentRoom.users.values()).every(u => u.isReady);
						
						if (!allReady)
							return;

						console.log(`Starting game for room ${uuid!}`);
						currentRoom.isGameStarted = true;

						const gameStartMessage = JSON.stringify({ 
							type: 'game_starting',
							gameType: currentRoom.gameType });
						
						currentRoom.users.forEach(u => u.socket.send(gameStartMessage));
						rooms.delete(uuid!);
						break;
				}
			} catch (error) {
				console.error('Invalid message format:', error);
			}
		});

		socket.on('close', () => {

			const roomToLeave = rooms.get(uuid!);
			if (roomToLeave) {
				roomToLeave.users.delete(username);
				console.log(`${username} disconnected from room ${uuid!}`);

				if (roomToLeave.users.size === 0) {
					rooms.delete(uuid!);
					console.log(`Room ${uuid!} deleted because em^ty`);
				}
				else { // delegate host
					if (roomToLeave.host !== undefined && roomToLeave.host === username) {
						roomToLeave.host = roomToLeave.users.keys().next().value;
						console.log(`${roomToLeave.host} is the new host.`);
					}
					broadcastSystemMessage(roomToLeave, `${username} has left the room.`);
					broadcastRoomUpdate(roomToLeave);
				}
			}
		});
	});

	app.get('/chat', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {

		const token = req.headers['x-access-token'] ? req.headers['x-access-token'] : req.cookies['x-access-token']; 

		if (!token) {
			// socket.send(JSON.stringify({
			// 	type: 'notLog',
			// 	message: 'the user is not log' }))
			// return ;
		}

		const decoded = app.jwt.verify(token) as { user: string };
		const username = decoded.name;

		loadMe(app, username).then((tmp: UserData) => {

			console.log('les infos valent', tmp);
			const user: UserChat = {
				username: username,
				userId: tmp.id,
				email: tmp.email,
				avatar_url: tmp.avatar_url || "../uploads/avatar3.png",
				socket: socket,
			};
			live.set(user.username, user);
		});

		// dire a tous ceux dont user.username est ami d'update leur UI

		socket.on('message', (message: string) => {
			try {
				const data = JSON.parse(message);

				const sender = live.get(username)!;

				// attention envoyer l'id plutot psque si la personne change de username on trouve plus ?

				switch (data.type) {
					case 'chat_message':
						sendChatMessage(username, data)
						break;
					
					case 'friend_request':
						addFriend(app, sender, data.dest);
						break;
					case 'accept_friend_request':
						console.log("dans le bueno accept_friend_request")
						acceptFriend(app, sender, data.dest)
						
						// fonction pour handle
						break;
					case 'decline_friend_request':
						console.log("dans le bueno decline_friend_request")
						// fonction pour handle
						break;
					default:
						console.warn(`recoit un event inconnu`)
				}
			} catch (error) {
				console.error('Invalid message format:', error);
			}
		});

		socket.on('close', () => {
			
			live.delete(username);
		});

	})

  // Endpoint WebSocket /alive : signale la présence de l'utilisateur
  app.get('/alive', { websocket: true }, async (connection: WebSocket, req: FastifyRequest) => {
    let userId: number | null = null;
    let authenticated = false;

    connection.on('message', async (msg: string) => {
      try {
        const data = JSON.parse(msg);
        
        if (!authenticated) {
          // Premier message doit contenir le token
          if (data.type === 'ping' && data.token) {
            try {
              const decoded = app.jwt.verify(data.token) as { user: string; name: string };
              const user = await app.userService.findByUsername(decoded.name);
              if (!user) throw new Error('User not found');
              userId = user.id;
              authenticated = true;
              
              // Premier signal de présence
              await redis.set(`alive:${userId}`, '1', { EX: 10 });
              console.log(`User ${decoded.name} (ID: ${userId}) connected to /alive`);
            } catch (e) {
              connection.send(JSON.stringify({ type: 'auth_error', message: 'Invalid or expired token' }));
              connection.close();
              return;
            }
          } else {
            connection.send(JSON.stringify({ type: 'auth_error', message: 'Authentication required' }));
            connection.close();
            return;
          }
        } else {
          // Messages suivants : ping pour maintenir la présence
          if (data.type === 'ping' && userId) {
            await redis.set(`alive:${userId}`, '1', { EX: 10 });
          }
        }
      } catch (error) {
        console.error('Invalid message format:', error);
      }
    });

    connection.on('close', async () => {
      if (userId) {
        await redis.del(`alive:${userId}`);
        console.log(`User ${userId} disconnected from /alive`);
      }
    });
  });

  app.get('/alive/:userID', { websocket: true }, async (socket: WebSocket, req: FastifyRequest) => {
    const { userID } = req.params as { userID: string };
    const checkAlive = async () => {
      const isAlive = await redis.exists(`alive:${userID}`);
      socket.send(JSON.stringify({ type: 'alive_status', userID, alive: !!isAlive }));
    };
    await checkAlive();
    const interval = setInterval(checkAlive, 5000);
    socket.on('close', () => {
      clearInterval(interval);
    });
  });
}

function broadcastRoomUpdate(room: Room) {
	const stateToSend = {
		id: room.id,
		name: room.name,
		gameType: room.gameType,
		maxPlayers: room.maxPlayers,
		users: Array.from(room.users.values()).map(u => ({ username: u.username, isReady: u.isReady })),
		host: room.host,
		isGameStarted: room.isGameStarted,
		ai: room.ai,
	};

	const message = JSON.stringify({
		type: 'room_update',
		room: stateToSend });

	room.users.forEach(user => {
		if (user.socket.readyState === WebSocket.OPEN)
			user.socket.send(message); });
}

function broadcastSystemMessage(room: Room, content: string) {

	const message = JSON.stringify({
		type: 'system_message',
		content: content });

	room.users.forEach(user => {
		if (user.socket.readyState === WebSocket.OPEN)
			user.socket.send(message); });
}

function sendChatMessage(username: string, data: any) {

	// check que le destinataire fait partie de sa liste d'amis 

	const message = JSON.stringify({
		type: 'chat_message',
		username: username,
		message: data.message,
	});
	// envoie au destinataire
	live.get(data.dest)?.socket.send(message);
}

function broadcastSystemMessageChat(content: string) {
	const message = JSON.stringify({
		type: 'system_message',
		content: content
	});
	live.forEach(user => {
		if (user.socket.readyState === WebSocket.OPEN) {
			user.socket.send(message);
		}
	});
}

async function loadMe(app: FastifyInstance, username: string): Promise<UserData> {
	return await app.userService.findByUsername(username);
}

async function addFriend(app: FastifyInstance, user: UserChat, friendName: string) {

	if (friendName === user.username) {
		const message = JSON.stringify({
			type: 'debug',
			content: 'you cannot add yourself as a friend dumbass'
		});
		user.socket.send(message)
		return;
	}

	// 1 - check que le user exist
	const friend = await app.userService.findByUsername(friendName);
	if (!friend) {
		const message = JSON.stringify({
			type: 'debug',
			content: 'user not found'
		});
		user.socket.send(message)
		return;
	}
	
		
	// 2 - check si une relation n'existe pas déjà
	const relations: Relation[] = await app.friendService.getRelations(user.userId);

	relations.forEach((rel, index) => {
			console.log(`Relation ${index + 1}:
		- User 1: ${rel.user_1} (state: ${rel.user1_state})
		- User 2: ${rel.user_2} (state: ${rel.user2_state})
		`);
	});

	const relation = relations.find(rel => rel.user_1 === friend.id || rel.user_2 === friend.id);

	if (relation) {
		user.socket.send(JSON.stringify({
			type: 'updateUI',
			message: `tu l'as déjà en amis` }))
		// 3 - check que l'un des deux n'a pas bloqué l'autre
		// 4 - check que l'invitation n'a pas déjà été faites || l'autre l'a déjà ajouté au quel cas on normalise la relation
		// identifie quel est l'état de la relation et envoyer un msg en fonction
		return;
	}


	// 5 - envoyer une demande + creer l'instance dans db friends avec userid des deux personnes
	//	 |__ update l'état, qui a ajouté qui
	await app.friendService.createRelation(user.userId, friend.id, 'waiting', 'requested');

	
	console.log(`${user.username} requested ${friendName} to be friends`)
	// send au user le statut de la demande
	user.socket.send(JSON.stringify({
		type: 'updateUI',
		message: 'new friend relation' }))
	// send au friend l'invitation s'il est connecte
	// dans update UI livechat -- onglet demandes
	// on passe sur tous les friends du user et afficher seulement les instances ou le state de l'autre user est à `asking`
}

async function acceptFriend(app: FastifyInstance, user: UserChat, friendName: string) {

	const friend = await app.userService.findByUsername(friendName);
	const relations: Relation[] = await app.friendService.getRelations(user.userId);
	const relation = relations.find(rel => rel.user_1 === friend.id || rel.user_2 === friend.id);

	if (!relation || relation.id === -1) {
		console.error(`couldnt find the relation to accept friendship`);
		return;
	}
	app.friendService.acceptRelation(relation.id)
}

function broadcastMatchmaking(data: any) {

	for (const user of matchmaking) {
		if (user.readyState === WebSocket.OPEN) {
			console.log(`je send a tous le monde`)
			user.send(JSON.stringify(data))
		}
	}
}



export default webSocketRoutes;

