import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';


interface Relation {
	user_1: number;
	user_2: number;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked';
}

async function friendRoutes(app: FastifyInstance) {
	
	app.get('/relations:userid', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const database = db.getDatabase();

			const { userid } = request.query as { userid?: number };

			if (!userid)
				throw new Error ("missing userid in the request body");

			const relations = await new Promise<Relation[] | null>((resolve, reject) => {

				database.all(
					'SELECT * FROM friends WHERE user_1 = ? || user_2 = ?',
					[ userid, userid ],
					(err: any, row: Relation[] | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			return reply.send({
				message: `friends du user ${userid}`,
				relations: relations,
			});
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /friend/userId',
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
				message: `nouvelle amitie entre ${user_1} et ${user_2}`,
			});
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur POST /friend',
				details: err.message });
		}
	})
}

export default friendRoutes;