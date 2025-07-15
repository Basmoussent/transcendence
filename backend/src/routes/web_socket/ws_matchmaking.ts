import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/*

const matchmaking = new Array<WebSocket>();

export function ws_matchmaking(socket: any, req: FastifyRequest) {

	// Vérification du token
	const token = req.headers['x-access-token'] ? req.headers['x-access-token'] : req.cookies['x-access-token']; 
	
	if (!token) {
		console.log('⚠️  Aucun token fourni. Détails de la requête :');
		console.log('Headers :', JSON.stringify(req.headers, null, 2));
		console.log('Cookies :', JSON.stringify(req.cookies, null, 2));
		socket.send(JSON.stringify({
			type: 'notLog',
			message: 'the user is not log' }))
		return ;
	}
	matchmaking.push(socket);
	socket.on('message', (message: any) => {
		try {
			const data = JSON.parse(message.toString());
			
			switch (data.type) {
				case 'updateUI':
					broadcastMatchmaking(data);
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
		matchmaking.splice(id, 1);

		console.log(`user left matchmaking`)
	});
}

function broadcastMatchmaking(data: any) {

	for (const user of matchmaking) {
		if (user.readyState === WebSocket.OPEN) {
			console.log(`je send a tous le monde`)
			user.send(JSON.stringify(data))
		}
	}
}

*/