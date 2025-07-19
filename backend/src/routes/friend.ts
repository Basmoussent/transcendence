import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface Relation {
	user_1: string;
	user_2: string;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked';
}

async function friendRoutes(app: FastifyInstance) {

	app.get('/:username', async function (request: FastifyRequest, reply: FastifyReply) {

		try {

			const { username } = request.query as { username?: string};

			console.log('🔍 Debug - Requested friends for username:', username);

			if (!username)
				throw new Error ("missing username in the request body");

			const friends = await app.friendService.getFriends(username);

			return friends;
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /friend/:username',
				details: err.message });
		}
	})
	
	app.get('/relations/:username', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { username } = request.query as { username?: string };

			if (!username)
				throw new Error ("missing username in the request body");

			const relations = await app.friendService.getRelations(username);

			return reply.send({
				message: `friends du user ${username}`,
				relations: relations,
			});
		}
		catch (err: any) {
			console.error('❌ Error in /relations:', err);
			return reply.status(500).send({
				error: 'erreur GET /friend/relations/:username',
				details: err.message });
		}
	});

	app.post('/', async function (request: FastifyRequest<{ Body: Relation }>, reply: FastifyReply) {

		try {
			const { user_1, user_2, user1_state, user2_state } = request.body;

			if (!user_1 || !user_2 || !user1_state || !user2_state)
				throw new Error("missing fields for a new friendship");

			await app.friendService.createRelation(user_1, user_2, user1_state, user2_state)
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur POST /friend',
				details: err.message });
		}
	})

	app.get('/history', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { user1, user2 } = request.query as { user1?: string, user2?: string };

			if (!user1 || !user2)
				return reply.status(400).send({ error: 'user1 and user2 are required' });

			const history = await app.chatService.retrieveChatHistory(user1, user2);
			return reply.send(history);
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur get /history',
				details: err.message });
		}
	});
}

export default friendRoutes;