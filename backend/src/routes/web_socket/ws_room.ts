import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { matchmaking, broadcastMatchmaking } from './ws_matchmaking';

interface User {
	username: string;
	isReady: boolean;
	socket: WebSocket;
}

interface Room {
	id: string;
	name: string;
	gameType: string;
	maxPlayers: number;
	users: Map<string, User>;
	host: string;
	isGameStarted: boolean;
	ai: number;
}

export const rooms = new Map<string, Room>();

async function broadcastRoomUpdate(app: FastifyInstance, room: Room) {
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

	const tmp = JSON.stringify({
		type: 'updateUI'
	})

	broadcastMatchmaking(JSON.parse(tmp.toString()));

	await app.roomService.updateGame(room);

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
	const token = req.headers['x-access-token'] ? req.headers['x-access-token'] : req.cookies['x-access-token']; 
		
	if (!token) {
		console.log('⚠️  Aucun token fourni. Détails de la requête :');
		console.log('Headers :', JSON.stringify(req.headers, null, 2));
		console.log('Cookies :', JSON.stringify(req.cookies, null, 2));
		socket.send(JSON.stringify({
			type: 'notLog',
			message: 'the user is not log' }));
		return ;
	}

	const decoded = app.jwt.verify(token as string) as { user: string; name: string };
	const username = decoded.name;

	const { uuid } = req.params as { uuid: string };

	let room = rooms.get(uuid);

	const game = await app.gameService.getGame(uuid);

	if (!game)
		return;

	console.log(game.id);

	const user: User = {
		username: username,
		isReady: false, 
		socket: socket };


	if (!room) {
		room = {
			id: uuid,
			name: `Room ${uuid.substring(0, 5)}`,
			gameType: game.game_type,
			maxPlayers: game.users_needed,
			users: new Map(),
			host: username,
			isGameStarted: false,
			ai: 0,
		};
		rooms.set(uuid!, room);
	}

	room.users.set(username, user);

	console.log(JSON.stringify(room, null, 4));

	if (room.maxPlayers === room.users.size + room.ai) {
		console.log("bah qiwudbqwiudbqiwu\n\n\n\ndbq")
		socket.send(JSON.stringify({
			type: 'error',
			message: 'Room is full' }));
			console.log('je vais close le socket')
		return;
	}

	console.warn(`room.maxPlayers === room.users.size + room.ai --> ${room.maxPlayers} === ${room.users.size} + ${room.ai}`)

	broadcastSystemMessage(room, `${username} has joined the room.`);
	await broadcastRoomUpdate(app, room);
	await app.roomService.updateGame(room)
	socket.on('message', async (message: string) => {
		try {
			const data = JSON.parse(message);

			app.jwt.verify(data.token);
			
			const currentRoom = rooms.get(uuid!)!;
			const currentUser = currentRoom.users.get(username)!;

			console.log()

			switch (data.type) {
				case 'toggle_ready':
					currentUser.isReady = !currentUser.isReady;
					console.log(`${username} --> isready == ${currentUser.isReady}`);
					await broadcastRoomUpdate(app, currentRoom);
					break;

				case 'game_type':
					currentRoom.gameType = data.name;
					currentRoom.ai = 0;
					await broadcastRoomUpdate(app, currentRoom);
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
					currentRoom.maxPlayers = data.players
					await broadcastRoomUpdate(app, currentRoom);
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
					if (currentRoom.host !== username || currentRoom.users.size < 2)
						return;

					const allReady = Array.from(currentRoom.users.values()).every(u => u.isReady);

					if (!allReady)
						return;

					console.log(`Starting game for room ${uuid!}`);
					currentRoom.isGameStarted = true;

					const gameStartMessage = JSON.stringify({ 
						type: 'game_starting',
						gameType: currentRoom.gameType
					});
					
					currentRoom.users.forEach(u => u.socket.send(gameStartMessage));
					rooms.delete(uuid!);
					break;
			}
		}
		catch (error) {
			console.error('Invalid message format:', error);
		}
	});

	socket.on('close', async () => {

		const roomToLeave = rooms.get(uuid!);
		if (roomToLeave) {
			roomToLeave.users.delete(username);
			console.log(`${username} disconnected from room ${uuid!}`);

			if (roomToLeave.users.size === 0) {
				rooms.delete(uuid!);
				console.log(`Room ${uuid!} deleted because empty`);
			}
			else { // delegate host
				if (roomToLeave.host === username) {
					roomToLeave.host = roomToLeave.users.keys().next().value;
					console.log(`${roomToLeave.host} is the new host.`);
				}
				broadcastSystemMessage(roomToLeave, `${username} has left the room.`);
				await broadcastRoomUpdate(app, roomToLeave);
			}
		}
	});
}