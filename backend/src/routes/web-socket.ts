import { db } from '../database';
import { FastifyInstance, FastifyRequest } from 'fastify';

async function webSocketRoutes(app: FastifyInstance) {

	app.get('/ws', { websocket: true }, (socket: any , req: FastifyRequest) => {
		console.log("a user just connected on /ws");
		socket.on('message', (message: string) => {
			socket.send(message)
		})
	});
}

export default webSocketRoutes;

