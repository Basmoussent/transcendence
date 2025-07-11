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
		socket.on('close', () => {
		const index = dict.get("clients").indexOf(socket);
		if (index !== -1) {
			dict.get("clients").splice(index, 1); // Supprimer le client de la liste
			console.log("a user just disconnected from /matchmaking");
		}
	});
	});

	app.get('/room/:uuid', { websocket: true }, (socket: any , req: FastifyRequest) => {

		const uuid = (req.params as any).uuid;

		if (!dict.get("room").has(uuid)) {
			dict.get("room").set(uuid, []);
		}

		dict.get("room").get(uuid).push(socket);
		console.log(`a user just connected on the room ${uuid}`);

		socket.on('message', (message: any) => {
			dict.get("room").get(uuid).forEach((client: any) => {
				if (client !== socket)
					client.send(message.toString())
			})
		})
	});
}

export default webSocketRoutes;

