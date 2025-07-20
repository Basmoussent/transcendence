import { FastifyInstance, FastifyRequest } from 'fastify';

export function validateToken(request: FastifyRequest, app: FastifyInstance) {
	const token = request.headers['x-access-token'] ? request.headers['x-access-token'] : request.cookies['x-access-token']; 
		
	//TALAN
	if (!token)
		return null;
	
	try {
		const payload = app.jwt.verify(token) as { user: string };
		const email = payload.user;
		return token;
	}
	catch {
		return null;
	}
}