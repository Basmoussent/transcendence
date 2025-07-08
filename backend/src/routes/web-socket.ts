import { db } from '../database';
import { FastifyInstance, FastifyRequest } from 'fastify';

async function webSocketRoutes(app: FastifyInstance) {

	let clients = [];

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

