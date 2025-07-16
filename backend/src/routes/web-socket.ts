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

