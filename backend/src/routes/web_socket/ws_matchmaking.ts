import { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';

export const matchmaking = new Array<WebSocket>();

export function broadcastMatchmaking(data: any) {

	for (const user of matchmaking)
		if (user.readyState === WebSocket.OPEN)
			user.send(JSON.stringify(data))
}

export async function broadcastMatchmakingWithWinrates(app: FastifyInstance, data: any) {
	// Si c'est une mise à jour de l'UI, on peut enrichir avec les winrates
	if (data.type === 'updateUI') {
		// Les winrates sont déjà calculés dans l'API /available
		// On peut juste envoyer le signal de mise à jour
	}
	
	for (const user of matchmaking)
		if (user.readyState === WebSocket.OPEN)
			user.send(JSON.stringify(data))
}

export function handleMatchmaking(socket: WebSocket, req: FastifyRequest) {
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

	matchmaking.push(socket);
	console.log("a user just connected on /matchmaking");
	socket.on('message', (message: any) => {
		try {
			const data = JSON.parse(message.toString());
			
			switch (data.type) {
				case 'updateUI':
					broadcastMatchmaking(data);
					break;
				case 'leave':
					const id = matchmaking.indexOf(socket);
					if (id !== -1)
						matchmaking.splice(id, 1);
				case 'ping':
					socket.send(JSON.stringify({
						type: 'pong'
					}));
					break;
				default:
					console.log(`l'event existe pas`)
			}
		}
		catch (error) {
			console.error('Invalid message format:', error);
		}
	});
	socket.on('close', () => {
		const id = matchmaking.findIndex(user => user === socket);
		if (id !== -1)
			matchmaking.splice(id, 1);
		console.log(`user left matchmaking`)
	});
}
