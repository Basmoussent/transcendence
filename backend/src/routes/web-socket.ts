import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

interface User {
	username: string;
	isReady: boolean;
	socket: WebSocket;
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

const rooms = new Map<string, Room>();

async function webSocketRoutes(app: FastifyInstance) {

	const dict = new Map();

	dict.set("clients", [])
	dict.set("test", [])


	app.get('/ws', { websocket: true }, (socket: any , req: FastifyRequest) => {

		dict.get("test").push(socket)
		console.log("a user just connected on /ws");
		socket.on('message', (message: any) => {
			dict.get("test").forEach((client: any) => {
				if (client !== socket)
					client.send(message.toString())
			})
		})
	});

	app.get('/matchmaking', { websocket: true }, (socket: any , req: FastifyRequest) => {

		dict.get("clients").push(socket);
		console.log("a user just connected on /matchmaking");
		socket.on('message', (message: any) => {
			dict.get("clients").forEach((client: any) => {
				if (client !== socket)
					client.send(message.toString())
			})
		})
		socket.on('close', () => {
			const index = dict.get("clients").indexOf(socket);
			if (index !== -1) {
				dict.get("clients").splice(index, 1); // Supprimer le client de la liste
				console.log("a user just disconnected from /matchmaking");
			}
		});
	});

	app.get('/room/:uuid', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {

		let token = req.headers['x-access-token'] as string;
        
		if (!token) {
			token = req.cookies['x-access-token'];
		}
		
		if (!token) {
			socket.send(JSON.stringify({
				type: 'notLog',
				message: 'the user is not log' }))
			return ;
		}

		const decoded = app.jwt.verify(token) as { user: string };
		const username = decoded.name;

		const { uuid } = req.params as { uuid: string };

		// recup le bon usernam en faisant un appel /api/me ?

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

			rooms.set(uuid, room);
		}

		if (room.users.size >= room.maxPlayers) {
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

		console.log(`${username} connected to room ${uuid}`);
		broadcastSystemMessage(room, `${username} has joined the room.`);
		broadcastRoomUpdate(room);

		socket.on('message', (message: string) => {
			try {
				const data = JSON.parse(message);
				const currentRoom = rooms.get(uuid)!;
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

						console.log(`Starting game for room ${uuid}`);
						currentRoom.isGameStarted = true;

						const gameStartMessage = JSON.stringify({ 
							type: 'game_starting',
							gameType: currentRoom.gameType });
						
						currentRoom.users.forEach(u => u.socket.send(gameStartMessage));
						rooms.delete(uuid);
						break;
				}
			} catch (error) {
				console.error('Invalid message format:', error);
			}
		});

		socket.on('close', () => {

			const roomToLeave = rooms.get(uuid);
			if (roomToLeave) {
				roomToLeave.users.delete(username);
				console.log(`${username} disconnected from room ${uuid}`);

				if (roomToLeave.users.size === 0) {
					rooms.delete(uuid);
					console.log(`Room ${uuid} deleted because em^ty`);
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

export default webSocketRoutes;