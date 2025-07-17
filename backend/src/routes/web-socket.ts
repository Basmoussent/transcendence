import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { handleMatchmaking } from './web_socket/ws_matchmaking';
import { handleRoom } from './web_socket/ws_room';
import { handleChat } from './web_socket/ws_chat';
import { handleAlive, handleAliveStatus } from './web_socket/ws_alive';

async function webSocketRoutes(app: FastifyInstance) {

	app.get('/matchmaking', { websocket: true }, (socket: any, req: FastifyRequest) => {
		handleMatchmaking(socket, req);
	});

	app.get('/room/:uuid', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		handleRoom(app, socket, req);
	});

	
	// app.get('/alive', { websocket: true }, async (connection: any, req: FastifyRequest) => {
	// 	const token = validateToken(req, app);
	// 	if (!token) {
	// 		console.log('❌ No token provided for WebSocket connection on /alive');
	// 		connection.close();
	// 		return;
	// 	}
	// 	try {
	// 		const decoded = app.jwt.verify(token) as { user: string; name: string };
	// 		const userId = decoded.name;
	// 		await redis.set(`online:${userId}`, '1', { EX: 15 });
	// 		connection.on('message', async (msg: string) => {
	// 			if (msg === 'ping') {
	// 				await redis.set(`online:${userId}`, '1', { EX: 60 });
	// 			}
	// 		});
	// 	}
	// 	catch (error) {
	// 		console.log('❌ Invalid token for WebSocket connection on /alive');
	// 		connection.close();
	// 		return;
	// 	}

		
	// });

	// app.get('/alive/:userId', async (req: FastifyRequest, res: FastifyReply) => {
	// 	const token = validateToken(req, app);
	// 	if (!token) {
	// 		console.log('❌ No token provided for WebSocket connection on /alive');
	// 		res.status(401).send('Unauthorized');
	// 		return;
	// 	}
	// 	try {
	// 		const decoded = app.jwt.verify(token) as { user: string; name: string };
	// 		const userId = req.params.userId;

	// 		const isMember = await redis.sIsMember(`online`, userId);
	// 		if (isMember) {
	// 			res.status(200).send('alive');
	// 		  } else {
	// 			res.status(200).send('dead');
	// 		  }
	// 	}
	// 	catch (error) {
	// 		console.log('❌ Invalid token for WebSocket connection on /alive');
	// 		res.status(401).send('Unauthorized');
	// 		return;
	// 	}
	// });

	app.get('/chat', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		handleChat(app, socket, req);
	});

	app.get('/alive', { websocket: true }, (connection: WebSocket, req: FastifyRequest) => {
		handleAlive(connection, req, app);
	});

	app.get('/alive/:userID', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		handleAliveStatus(socket, req);
	});
}

export default webSocketRoutes;

