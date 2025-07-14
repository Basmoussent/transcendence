import { FastifyInstance, FastifyRequest } from 'fastify';

export function validateToken(request: FastifyRequest, app: FastifyInstance) {
	let token = request.headers['x-access-token'] as string;
      
      if (!token) {
        token = request.cookies['x-access-token'];
      }
      
      if (!token) {
		return null;
	}
	try {
		const payload = app.jwt.verify(token) as { user: string };
		const email = payload.user;
		return token;
	}
	catch
	{
		return null;
	}
}