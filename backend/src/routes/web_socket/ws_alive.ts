import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { redis } from '../../index';

export function handleAlive(connection: WebSocket, req: FastifyRequest, app: FastifyInstance) {
	let userId: number | null = null;
	let username: string | null = null;
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
						username = decoded.name;
						authenticated = true;
						
						// Premier signal de présence - statut online pendant 15 secondes
						await redis.set(`${userId}:online`, '1', { EX: 15 });
						await redis.set(`${username}:online`, '1', { EX: 15 });
						console.log(`✅ User ${username} (ID: ${userId}) connected to /alive - Status: ONLINE`);
						
						// Confirmation d'authentification
						connection.send(JSON.stringify({ 
							type: 'auth_success', 
							message: 'Authenticated successfully',
							userId: userId,
							username: username
						}));
					} catch (e) {
						console.error('❌ Authentication error:', e);
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
				if (data.type === 'ping' && userId && username) {
					await redis.set(`${userId}:online`, '1', { EX: 15 });
					await redis.set(`${username}:online`, '1', { EX: 15 });
					console.log(`🔄 User ${username} (ID: ${userId}) ping - Status: ONLINE`);
					
					// Confirmation du ping
					connection.send(JSON.stringify({ 
						type: 'pong', 
						message: 'Ping received',
						timestamp: Date.now()
					}));
				}
			}
		} catch (error) {
			console.error('❌ Invalid message format:', error);
			connection.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
		}
	});

	connection.on('close', async () => {
		if (userId) {
			await redis.del(`${userId}:online`);
			if (username) {
				await redis.del(`${username}:online`);
			}
			console.log(`❌ User ${username || userId} disconnected from /alive - Status: OFFLINE`);
		}
	});

	connection.on('error', async (error) => {
		console.error('❌ WebSocket error:', error);
		if (userId) {
			await redis.del(`${userId}:online`);
			if (username) {
				await redis.del(`${username}:online`);
			}
		}
	});
}

export function handleAliveStatus(socket: WebSocket, req: FastifyRequest) {
	const { userID } = req.params as { userID: string };
	
	const checkAlive = async () => {
		try {
			// Vérifier le statut par ID et par username
			const isAliveById = await redis.exists(`${userID}:online`);
			const isAliveByUsername = await redis.exists(`${userID}:online`);
			const isAlive = isAliveById || isAliveByUsername;
			
			socket.send(JSON.stringify({ 
				type: 'alive_status', 
				userID, 
				alive: !!isAlive,
				timestamp: Date.now()
			}));
		} catch (error) {
			console.error('❌ Error checking alive status:', error);
			socket.send(JSON.stringify({ 
				type: 'error', 
				message: 'Error checking status',
				userID 
			}));
		}
	};
	
	checkAlive();
	
	const interval = setInterval(checkAlive, 5000);
	
	socket.on('close', () => {
		clearInterval(interval);
		console.log(`📡 Status monitoring stopped for user ${userID}`);
	});
}

// Fonction utilitaire pour vérifier le statut online d'un utilisateur
export async function isUserOnline(userIdOrUsername: string | number): Promise<boolean> {
	try {
		const isAliveById = await redis.exists(`${userIdOrUsername}:online`);
		const isAliveByUsername = await redis.exists(`${userIdOrUsername}:online`);
		return isAliveById || isAliveByUsername;
	} catch (error) {
		console.error('❌ Error checking user online status:', error);
		return false;
	}
}

// Fonction utilitaire pour obtenir tous les utilisateurs online
export async function getOnlineUsers(): Promise<string[]> {
	try {
		const keys = await redis.keys('online:*');
		return keys.map(key => key.replace('online:', ''));
	} catch (error) {
		console.error('❌ Error getting online users:', error);
		return [];
	}
}