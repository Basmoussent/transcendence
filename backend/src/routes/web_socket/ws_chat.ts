import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

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

interface Relation {
	id: number | -1;
	user_1: string;
	user_2: string;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
}

const live = new Map<string, UserChat>();

export function handleChat(app: FastifyInstance, socket: WebSocket, req: FastifyRequest) {
	try {
		const token = req.headers['x-access-token'] ? req.headers['x-access-token'] : req.cookies['x-access-token']; 

		if (!token) {
			// socket.send(JSON.stringify({
			// 	type: 'notLog',
			// 	message: 'the user is not log' }))
			// return ;
		}

		const decoded = app.jwt.verify(token as string) as { user: string, name: string };
		const username = decoded.name;

		loadMe(app, username).then((tmp: UserData) => {

			try {
			console.log('les infos valent', tmp);
			const user: UserChat = {
				username: username,
				userId: tmp.id,
				email: tmp.email,
				avatar_url: tmp.avatar_url || "../uploads/avatar3.png",
				socket: socket,
			};
			live.set(user.username, user);
			} catch (error) {
				console.error('Error in handleChat:', error);
				socket.close();
			}
		});

		// dire a tous ceux dont user.username est ami d'update leur UI

		socket.on('message', (message: string) => {
			handleMessage(message, username, app);
		});

		socket.on('close', () => {
			live.delete(username);
		});
	} catch (error) {
		console.error('Error in handleChat:', error);
		socket.close();
	}
}

async function handleMessage(message: string, username: string, app: FastifyInstance) {
	try {
		const data = JSON.parse(message);
		const sender = live.get(username)!;

		// attention envoyer l'id plutot psque si la personne change de username on trouve plus ?
		switch (data.type) {
			case 'chat_message':
				sendChatMessage(username, data)

				try {
					console.log("sender :", sender);
					console.log("data :", data);
					const user = await app.userService.findByUsername(data.dest);
					await app.chatService.logChatMessage(sender.userId, user.id, data.content);
				} catch (error) {
					console.error('Error logging chat message:', error);
					// Envoyer un message d'erreur au client sans fermer le WebSocket
					const errorMessage = JSON.stringify({
						type: 'error',
						message: error instanceof Error ? error.message : 'Failed to save message'
					});
					sender.socket.send(errorMessage);
				}
				break;
			
			case 'friend_request':
				addFriend(app, sender, data.dest);
				break;
			
			case 'accept_friend_request':
				acceptFriend(app, sender, data.dest)
				break;

			case 'deny_friend_request':
				denyFriend(app, sender, data.dest)
				break;

			case 'disconnection':
				live.delete(sender.username);
				console.log('je disconnect le user')
				break;
			default:
				console.warn(`recoit un event inconnu`)
		}
	}
	catch (error) {
		console.error('Invalid message format:', error);
	}
}

async function loadMe(app: FastifyInstance, username: string): Promise<UserData> {
	return await app.userService.findByUsername(username);
}

function sendChatMessage(username: string, data: any) {

	const message = JSON.stringify({
		type: 'chat_message',
		username: username,
		content: data.content,
	});
	// envoie au destinataire
	live.get(data.dest)?.socket.send(message);

}

async function addFriend(app: FastifyInstance, user: UserChat, friendName: string) {

	console.log(`🔍 Debug - addFriend called: ${user.username} wants to add ${friendName}`);

	if (friendName === user.username) {
		const message = JSON.stringify({
			type: 'debug',
			content: 'you cannot add yourself as a friend dumbass'
		});
		user.socket.send(message)
		return;
	}

	// 1 - check que le user exist

	console.log("doazndoianozdinaz  ", user);


	const friend = await app.userService.findByUsername(friendName);
	console.log(`🔍 Debug - Friend found:`, friend);
	
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
	console.log(`🔍 Debug - Existing relations for ${user.username}:`, relations);

	relations.forEach((rel, index) => {
			console.log(`Relation ${index + 1}:
		- User 1: ${rel.user_1} (state: ${rel.user1_state})
		- User 2: ${rel.user_2} (state: ${rel.user2_state})
		`);
	});

	const relation = relations.find(rel => rel.user_1 === friend.username || rel.user_2 === friend.username);

	if (relation) {
		console.log(`🔍 Debug - Relation already exists:`, relation);
		user.socket.send(JSON.stringify({
			type: 'updateUI',
			message: `tu l'as déjà en amis` }))
		// 3 - check que l'un des deux n'a pas bloqué l'autre
		// 4 - check que l'invitation n'a pas déjà été faites || l'autre l'a déjà ajouté au quel cas on normalise la relation
		// identifie quel est l'état de la relation et envoyer un msg en fonction
		return;
	}


	// 5 - envoyer une demande + creer l'instance dans db friends avec username des deux personnes
	//	 |__ update l'état, qui a ajouté qui
	console.log(`🔍 Debug - Creating relation: ${user.username} -> ${friend.username}`);
	await app.friendService.createRelation(user.userId, friend.id, 'waiting', 'requested');

	
	console.log(`${user.username} requested ${friendName} to be friends`)
	// send au user le statut de la demande

	const message = JSON.stringify({
		type: 'updateUI'
	});

	user.socket.send(message)
	live.get(friend.username)?.socket.send(message);
	// dans update UI livechat -- onglet demandes
	// on passe sur tous les friends du user et afficher seulement les instances ou le state de l'autre user est à `asking`
}

async function acceptFriend(app: FastifyInstance, user: UserChat, friendName: string) {

	const friend = await app.userService.findByUsername(friendName);
	const relations: Relation[] = await app.friendService.getRelations(user.userId);
	const relation = relations.find(rel => rel.user_1 === friend.id.toString() || rel.user_2 === friend.id.toString());

	if (!relation || relation.id === -1) {
		console.error(`couldnt find the relation to accept friendship`);
		return;
	}
	app.friendService.acceptRelation(relation.id)
	const message = JSON.stringify({
		type: 'updateUI'
	});

	// faire update l'interface aux deux users
	user.socket.send(message)
	live.get(friend.username)?.socket.send(message);
}

async function denyFriend(app: FastifyInstance, user: UserChat, friendName: string) {

	console.log("oaindozaindoaizndoaizndoianz")

	const friend = await app.userService.findByUsername(friendName);
	const relations: Relation[] = await app.friendService.getRelations(user.userId);
	const relation = relations.find(rel => rel.user_1 === friend.username || rel.user_2 === friend.username);

	if (!relation || relation.id === -1) {
		console.error(`couldnt find the relation to refuse friendship`);
		return;
	}

	await app.friendService.denyRelation(relation.id)
	const message = JSON.stringify({
		type: 'updateUI'
	});

	// faire update l'interface aux deux users
	user.socket.send(message)
	live.get(friend.username)?.socket.send(message);
}