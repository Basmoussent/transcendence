import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { matchmaking, broadcastMatchmaking, broadcastMatchmakingWithWinrates } from './ws_matchmaking';
import { db } from '../../database';

interface User {
	username: string;
	id: number;
	isReady: boolean;
	socket: WebSocket;
}

interface Room {
	id: string;
	name: string;
	gameType: string;
	maxPlayers: number;
	users: Map<number, User>;
	host: string;
	ai: number;
}

export const rooms = new Map<string, Room>();

async function broadcastRoomUpdate(app: FastifyInstance, room: Room) {
	let totalWinrate = 0;
	let playerCount = 0;
	const usersWithStats = [];

	for (const user of room.users.values()) {
		try {
			const stats = await app.userService.retrieveStats(user.username);
			if (stats) {
				const totalGames = (stats.pong_games || 0) + (stats.block_games || 0);
				const totalWins = (stats.pong_wins || 0) + (stats.block_wins || 0);
				const winrate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
				
				totalWinrate += winrate;
				playerCount++;
				
				usersWithStats.push({
					username: user.username,
					isReady: user.isReady,
					winrate: winrate
				});
			} else {
				usersWithStats.push({
					username: user.username,
					isReady: user.isReady,
					winrate: 0
				});
			}
		} catch (error) {
			console.error(`Erreur lors de la récupération des stats pour ${user.username}:`, error);
			usersWithStats.push({
				username: user.username,
				isReady: user.isReady,
				winrate: 0
			});
		}
	}

	console.log(`les users et leur stats${JSON.stringify(usersWithStats, null, 8)}`);

	const averageWinrate = playerCount > 0 ? Math.round(totalWinrate / playerCount) : 0;

	const stateToSend = {
		id: room.id,
		name: room.name,
		gameType: room.gameType,
		maxPlayers: room.maxPlayers,
		users: usersWithStats,
		host: room.host,
		ai: room.ai,
		averageWinrate: averageWinrate
	};

	await app.roomService.updateGame(room);

	const message = JSON.stringify({
		type: 'room_update',
		room: stateToSend });

	room.users.forEach(user => {
		if (user.socket.readyState === WebSocket.OPEN)
			user.socket.send(message); });

	const updateMessage = {
		type: 'updateUI'
	};

	await broadcastMatchmakingWithWinrates(app, updateMessage);


}

function broadcastSystemMessage(room: Room, content: string) {

	const message = JSON.stringify({
		type: 'system_message',
		content: content });

	room.users.forEach(user => {
		if (user.socket.readyState === WebSocket.OPEN)
			user.socket.send(message); });
}

export async function handleRoom(app: FastifyInstance, socket: WebSocket, req: FastifyRequest) {

	try {


		// Error in handleRoom: TypeError: Cannot read properties of undefined (reading 'x-access-token')
		// 	at handleRoom (/app/src/routes/web_socket/ws_room.ts:67:92)
		// 	at Object.<anonymous> (/app/src/routes/web-socket.ts:15:13)


		console.log("req.cookies", req.cookies);
		const token =  req.cookies['x-access-token'];
		console.log("token is ", token);
			
		if (!token) {
			console.log('⚠️  Aucun token fourni. Détails de la requête :');
			socket.send(JSON.stringify({
				type: 'notLog',
				message: 'the user is not log' }));
			return ;
		}

		const decoded = app.jwt.verify(token as string) as { user: string; name: string };
		const username = decoded.name;

		const tmp = await app.userService.findByUsername(username);

		const userid = tmp.id;


		const { uuid } = req.params as { uuid: string };

		let room = rooms.get(uuid);

		const game = await app.gameService.getGame(uuid);

		if (!game)
			return;

		if (!room) {
			room = {
				id: uuid,
				name: `Room ${uuid.substring(0, 5)}`,
				gameType: game.game_type,
				maxPlayers: game.users_needed,
				users: new Map(),
				host: username,
				ai: 0,
			};

			rooms.set(uuid!, room);
		}

		const user: User = {
			username: username,
			id: userid,
			isReady: false,
			socket: socket,
		};



		console.log(`le user.username ${user.username}`)
		console.log(`le user.id ${user.id}`)





		if ((room.users.size + room.ai >= room.maxPlayers) && room.ai >= 1)
			room.ai -= 1;

		room.users.set(user.id, user);

		broadcastSystemMessage(room, `${username} has joined the room.`);


		console.log(`la room ressemble a ca ${JSON.stringify({ ...room, users: Object.fromEntries(room.users) }, (key, value) => key === 'socket' ? undefined : value, 8)}`);

		
		await broadcastRoomUpdate(app, room);
		socket.on('message', async (message: string) => {
			try {
				const data = JSON.parse(message);

				app.jwt.verify(data.token);
				
				const currentRoom = rooms.get(uuid!)!;
				const currentUser = currentRoom.users.get(user.id)!;

				switch (data.type) {
					case 'toggle_ready':
						currentUser.isReady = !currentUser.isReady;
						console.log(`${username} --> isready == ${currentUser.isReady}`);
						await broadcastRoomUpdate(app, currentRoom);
						break;

					case 'game_type':
						currentRoom.gameType = data.name;
						currentRoom.maxPlayers = data.name === 'pong' ? 4 : 2;
						currentRoom.ai = 0;
						await broadcastRoomUpdate(app, currentRoom);
						await app.roomService.updateGame(room)
						break;

					case 'increase':
						currentRoom.ai += 1;
						console.log(currentRoom.ai)
						await broadcastRoomUpdate(app, currentRoom);
						break;

					case 'decrease':
						currentRoom.ai -= 1;
						console.log(currentRoom.ai)
						await broadcastRoomUpdate(app, currentRoom);
						break;
						
					case 'maxPlayer':

						//mettre a la bonne valeur:
						// si le host mais que user needed est a 2 alors qu'il y a 3 personnes plus une ia dans la room 
						// |____ supprimer l'ia et mettre userneeded a 3
						currentRoom.maxPlayers = data.players
						currentRoom.ai = 0;
						await broadcastRoomUpdate(app, currentRoom);
						await app.roomService.updateGame(room)
						break;
							
					case 'chat_message':
						const chatMessage = JSON.stringify({ 
							type: 'chat_message', 
							username: username,
							content: data.content
						});
						
						currentRoom.users.forEach(u => {
							if (u.socket.readyState === WebSocket.OPEN)
								u.socket.send(chatMessage);
						});
						break;
					
					case 'update_db':
						await app.roomService.updateGame(room);
						break;
					
					case 'start_game':
						if (currentRoom.host !== username)
							return;

						const allReady = Array.from(currentRoom.users.values()).every(u => u.isReady);

						if (!allReady)
							return;

						//ajuster le bon nombre de user dans la game
						if (currentRoom.users.size !== currentRoom.maxPlayers)
							currentRoom.maxPlayers= currentRoom.users.size;

						await broadcastRoomUpdate(app, currentRoom);

						const gameStartMessage = JSON.stringify({ 
							type: 'game_starting',
							gameType: currentRoom.gameType
						});
						
						currentRoom.users.forEach(u => u.socket.send(gameStartMessage));
						rooms.delete(uuid!);
						break;

					case 'ping':
						socket.send(JSON.stringify({
							type: 'pong'
						}));
						break;
					
				}
			}
			catch (error) {
				console.error('Invalid message format:', error);
			}
		});

		socket.on('close', async () => {

			const roomToLeave = rooms.get(uuid!)!;

			if (!roomToLeave)
				return;

			roomToLeave.users?.delete(user.id);
			console.log(`${username} disconnected from room ${uuid!}`);

			if (roomToLeave.users.size === 0) {
				rooms.delete(uuid!);
				console.log(`Room ${uuid!} deleted because empty`);
				app.gameService.deleteGame(uuid);
			}
			else {
				if (roomToLeave.host === username) {

					console.log("console log des familles :   ", roomToLeave.users.keys().next().value)


					///////TODO Erreur sqlite player 1 peut pas être nul mais l'est quand même bizarre.
					roomToLeave.host = roomToLeave.users.keys().next().value;
					
				}
				broadcastSystemMessage(roomToLeave, `${username} has left the room.`);
				await broadcastRoomUpdate(app, roomToLeave);
				await app.roomService.updateGame(roomToLeave);
			}
			
		});
	}
	catch (error) {
		console.error('Error in handleRoom:', error);
		socket.close();
	}
}


async function fetchMyUsername() {


	try {



	}
	catch (err) {
		console.error("non non dans le mauvais")
	}


}