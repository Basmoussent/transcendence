import { db } from '../database';
import { FastifyInstance, FastifyRequest } from 'fastify';
import {v4 as uuidv4} from 'uuid';

async function webSocketRoutes(app: FastifyInstance) {

	let clients = [];

	let uuid = uuidv4();

	console.log(`le uuid de la page est ${uuid}`);

	app.get('/ws', { websocket: true }, (socket: any , req: FastifyRequest) => {

		clients.push(socket);
		console.log("a user just connected on /ws");
		socket.on('message', (message: any) => {
			clients.forEach((client: any) => {
				if (client !== socket)
					client.send(message.toString())
			})
		})
	});
}

export default webSocketRoutes;

