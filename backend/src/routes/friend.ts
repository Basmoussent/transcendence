import { db } from '../database';
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
			const database = db.getDatabase();

			const { username } = request.query as { username?: string};

			console.log('🔍 Debug - Requested friends for username:', username);

			if (!username)
				throw new Error ("missing username in the request body");

			const friends = app.friendService.getFriends(username);

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
			const database = db.getDatabase();

			const { username } = request.query as { username?: string };

			console.log('🔍 Debug - Requested relations for username:', username);

			if (!username)
				throw new Error ("missing username in the request body");

			const relations = await new Promise<Relation[] | null>((resolve, reject) => {

				database.all(
					'SELECT * FROM friends WHERE user_1 = ? OR user_2 = ?',
					[ username, username ],
					(err: any, row: Relation[] | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});

			// const relations = app.friendService.getRelations();

			console.log('🔍 Debug - Found relations:', relations);

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
			const database = db.getDatabase();

			const { user_1, user_2, user1_state, user2_state } = request.body;

			if (!user_1 || !user_2 || !user1_state || !user2_state)
				throw new Error("missing fields for a new friendship");

			await new Promise<void>((resolve, reject) => {

				database.run(
					'INSERT INTO friends (user_1, user_2, user1_state, user2_state) VALUES (?, ?, ?, ?)',
					[ user_1, user_2, user1_state, user2_state ],
					(err: any) => {
						err ? reject(err) : resolve(); }
				);
			});
			return reply.send({
				message: `nouvelle realtion entre ${user_1} et ${user_2}`,
			});
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur POST /friend',
				details: err.message });
		}
	})

	app.get('/history', async function (request: FastifyRequest, reply: FastifyReply) {

		const { user1, user2 } = request.query as { user1?: string, user2?: string };

		if (!user1 || !user2)
			return reply.status(400).send({ error: 'user1 and user2 are required' });

		const history = await app.chatService.retrieveChatHistory(user1, user2);
		return reply.send(history);
	});
}

export default friendRoutes;