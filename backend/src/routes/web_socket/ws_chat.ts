import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

interface UserChat {
	username: string;
	id: number;
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
	user_1: number;
	user_2: number;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
}

export const live = new Map<number, UserChat>();

export async function handleChat(app: FastifyInstance, socket: WebSocket, req: FastifyRequest) {
	try {
		const token = req.cookies['x-access-token']; 

		if (!token) {
			socket.send(JSON.stringify({
				type: 'notLog',
				message: 'the user is not log' }))
			return ;
		}

		const decoded = app.jwt.verify(token as string) as { user: string, name: string };
		const username = decoded.name;

		const tmp = await app.userService.findByUsername(username);

		const user: UserChat = {
			username: tmp!.username,
			id: tmp!.id,
			email: tmp!.email,
			avatar_url: tmp?.avatar_url,
			socket: socket
		}

		if (!live.get(user.id)) {
			console.log("user pas encore connecte")
			live.set(user.id, user);
		}

		socket.on('message', (message: string) => {
			handleMessage(message, user, app);
		});

		socket.on('close', () => {
			live.delete(user.id);
		});

	} catch (error) {
		console.error('Error in handleChat:', error);
		socket.close();
	}
}

async function handleMessage(message: string, user: UserChat, app: FastifyInstance) {
	try {
		const data = JSON.parse(message);

		// attention envoyer l'id plutot psque si la personne change de username on trouve plus ?
		switch (data.type) {
			case 'chat_message':
				sendChatMessage(app, user, data)
				break;
			
			case 'friend_request':
				addFriend(app, user, data.dest);
				break;
			
			case 'accept_friend_request':
				acceptFriend(app, user, data.dest)
				break;

			case 'deny_friend_request':
				console.log("je recois quelque chose pour refuser")
				denyFriend(app, user, data.dest)
				break;

			case 'notify_tournament':
				notifyTournament(app, user, data)
				break;

			case 'disconnection':
				live.delete(user.id);
				console.log('je disconnect le user')
				break;
			case 'ping':
				user.socket.send(JSON.stringify({
					type: 'pong'
				}));
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

async function sendChatMessage(app: FastifyInstance, user: UserChat, data: any) {

	const message = JSON.stringify({
		type: 'chat_message',
		username: user.username,
		content: data.content,
	});
	// envoie au destinataire

	const friend = await app.userService.findByUsername(data.dest);

	if (!friend) {
		console.log("message pour quelqu'un qui n'existe pas");
		return;
	}

	live.get(friend.id)?.socket.send(message);

	try {
		console.log("sender :", user);
		console.log("data :", data);
		const dest = await app.userService.findByUsername(data.dest);
		await app.chatService.logChatMessage(user.id, dest!.id, data.content);
	}
	catch (error) {
		console.error('Error logging chat message:', error);
		// Envoyer un message d'erreur au client sans fermer le WebSocket
		const errorMessage = JSON.stringify({
			type: 'error',
			message: error instanceof Error ? error.message : 'Failed to save message'
		});
		user.socket.send(errorMessage);
	}

}

async function addFriend(app: FastifyInstance, user: UserChat, friendUsername: string) {

	// 1 - check que le user exist
	const friend = await app.userService.findByUsername(friendUsername);

	if (!friend) {
		console.log("le user n'existe pas");
		return ;
	}

	if (user.id == friend.id) {
		console.log("pourquoi tu t'ajouterais toi meme zig new");
		return ;
	}
		
	// 2 - check si une relation n'existe pas déjà
	//	|____ check que je ne suis pas bloque --> juste return
	//	|____ check que je ne l'ai pas deja demande --> juste return
	//	|____ check qu'il ne m'a pas deja demande --> accepter la demande d'ami


	const relation = await app.friendService.searchRelation(user.id, friend.id);

	if (relation) {
		const myState = relation.user_1 == String(user.id) ? relation.user1_state : relation.user2_state;
		const userState = relation.user_1 == String(friend.id) ? relation.user1_state : relation.user2_state;

		if (myState == 'normal' && userState == 'normal') {
			console.log(`tu as deja cette personne en ami`);
			return ;
		}
		else if (myState == 'waiting' && userState == 'requested') {
			console.log(`tu as deja demande cette personne en ami`);
			return ;
		}
		else if (myState == 'requested' && userState == 'waiting') {
			//accepter la relation
			console.log(`cette personne t'avais demande en ami, tu viens de l'accepter`);
			return ;
		}
		else if (myState == 'blocked' || userState == 'blocked') {
			console.log(`une des deux personnes est bloquee par l'autre`);
			return ;
		}
	}
	
	// 5 - envoyer une demande + creer l'instance dans db friends avec id des deux personnes
	//	 |__ update l'état, qui a ajouté qui

	await app.friendService.createRelation(String(user.id), String(friend.id), 'waiting', 'requested');
	const message = JSON.stringify({
		type: 'updateUI'
	});
	user.socket.send(message)
	live.get(friend.id)?.socket.send(message);
}

async function acceptFriend(app: FastifyInstance, user: UserChat, friendName: string) {

	const friend = await app.userService.findByUsername(friendName);
	if (!friend) {
		console.log("le user n'existe pas")
		return ;
	}

	const relation = await app.friendService.searchRelation(user.id, friend.id);
	if (!relation || relation.id === -1) {
		console.error(`couldnt find the relation to accept friendship`);
		return;
	}
	app.friendService.acceptRelation(relation.id)
	const message = JSON.stringify({
		type: 'updateUI'
	});
	user.socket.send(message)
	live.get(friend.id)?.socket.send(message);
}

async function denyFriend(app: FastifyInstance, user: UserChat, friendName: string) {

	const friend = await app.userService.findByUsername(friendName);
	if (!friend) {
		console.log("le user n'existe pas")
		return ;
	}
	const relation = await app.friendService.searchRelation(user.id, friend.id);
	if (!relation || relation.id === -1) {
		console.error(`couldnt find the relation to deny friendship`);
		return;
	}

	await app.friendService.denyRelation(relation.id)
	const message = JSON.stringify({
		type: 'updateUI'
	});

	console.log(`je send a ${user.username} et ${friend.username}`)
	user.socket.send(message)
	live.get(friend.id)?.socket.send(message);
}

async function notifyTournament(app: FastifyInstance, user: UserChat, data: any) {
	
	console.log("une game va se lance dans un tournoi, j'envoie la notif aux bons joueurs")
	
	for (const user of live.values()) {
		if (user.username == data.user1 || user.username == data.user2) {
			user.socket.send(JSON.stringify({
				type: 'notify_tournament',
				opponent: user.username == data.user1 ? data.user2 : data.user1,
			}));
		}
	}
}