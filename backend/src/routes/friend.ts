import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';


interface Relation {
	user_1: number;
	user_2: number;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked';
}

async function friendRoutes(app: FastifyInstance) {

	app.get('/:userid', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("récupérer les amis d'un user");

		try {
			const database = db.getDatabase();

			const { userId } = request.params as { userId?: number };

			if (!userId)
				throw new Error ("missing userId in the request body");

			const relation = await new Promise<Relation[] | null>((resolve, reject) => {

				database.get(
					'SELECT * FROM friends WHERE user_1 = ? || user_2 = ?',
					[ userId, userId ],
					(err: any, row: Relation[] | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			return reply.send({
				message: `friends du user ${userId}`,
				relation: relation,
			});
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /friend/userId',
				details: err.message });
		}
	});
	
}