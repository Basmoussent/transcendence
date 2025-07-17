import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { redis } from '../../index';

export function handleAlive(connection: WebSocket, req: FastifyRequest, app: FastifyInstance) {
	let userId: number | null = null;
	let authenticated = false;

	connection.on('message', async (msg: string) => {
		try {
			const data = JSON.parse(msg);
			
			if (!authenticated) {
				// Premier message doit contenir le token
				if (data.type === 'ping' && data.token) {
					try {
						const decoded = app.jwt.verify(data.token) as { user: string; name: string };
						const user = await app.userService.findByUsername(decoded.name);
						if (!user) throw new Error('User not found');
						userId = user.id;
						authenticated = true;
						
						// Premier signal de présence
						await redis.set(`alive:${userId}`, '1', { EX: 10 });
						console.log(`User ${decoded.name} (ID: ${userId}) connected to /alive`);
					} catch (e) {
						connection.send(JSON.stringify({ type: 'auth_error', message: 'Invalid or expired token' }));
						connection.close();
						return;
					}
				} else {
					connection.send(JSON.stringify({ type: 'auth_error', message: 'Authentication required' }));
					connection.close();
					return;
				}
			} else {
				// Messages suivants : ping pour maintenir la présence
				if (data.type === 'ping' && userId) {
					await redis.set(`alive:${userId}`, '1', { EX: 10 });
				}
			}
		} catch (error) {
			console.error('Invalid message format:', error);
		}
	});

	connection.on('close', async () => {
		if (userId) {
			await redis.del(`alive:${userId}`);
			console.log(`User ${userId} disconnected from /alive`);
		}
	});
}

export function handleAliveStatus(socket: WebSocket, req: FastifyRequest) {
	const { userID } = req.params as { userID: string };
	const checkAlive = async () => {
		const isAlive = await redis.exists(`alive:${userID}`);
		socket.send(JSON.stringify({ type: 'alive_status', userID, alive: !!isAlive }));
	};
	
	checkAlive();
	
	const interval = setInterval(checkAlive, 5000);
	
	socket.on('close', () => {
		clearInterval(interval);
	});
}