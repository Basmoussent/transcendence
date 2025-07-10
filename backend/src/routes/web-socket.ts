import { db } from '../database';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

async function webSocketRoutes(app: FastifyInstance) {

	const dict = new Map();
	const room = new Map(); 

	dict.set("room", room)
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
	});

	app.get('/room/:uuid', { websocket: true }, (socket: any , req: FastifyRequest) => {

		const roomId = (req.params as any).roomId;

		if (!dict.get("room").has(roomId)) {
			dict.get("room").set(roomId, []);
		}

		dict.get("room").get(roomId).push(socket);

		console.log(`a user just connected on the room ${roomId}`);
		socket.on('message', (message: any) => {
			dict.get("room").get(roomId).forEach((client: any) => {
				if (client !== socket)
					client.send(message.toString())
			})
		})
	});
}

export default webSocketRoutes;

