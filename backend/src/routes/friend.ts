import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface Relation {
	user_1: string;
	user_2: string;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
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
	
	app.get('/relations/:userid', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { userid } = request.query as { userid?: number };

			if (!userid)
				throw new Error ("missing userid in the request body");

			const relations = await app.friendService.getRelations(userid);

			return reply.send({
				message: `friends du user ${userid}`,
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

	app.post('/accept/:id', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { id } = request.params as { id?: number };

			if (!id)
				throw new Error("missing id for updating a relation");

			await app.friendService.acceptRelation(id);

			return reply.send({ message: `relation ${id} updated` });
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur PUT /friend/:id',
				details: err.message });
		}

	})

	app.delete('/:id', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { id } = request.params as { id?: number };

			if (!id)
				throw new Error("missing id for deleting a relation");

			await app.friendService.denyRelation(id);

			return reply.send({ message: `relation ${id} deleted` });
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur DELETE /friend/:id',
				details: err.message });
		}

	})


	///////TODO  on prend les id pas les username
	app.post('/relation', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { user1, user2,} = request.body as { user1?: string, user2?: string };

			if (!user1 || !user2)
				throw new Error("missing fields pour rechercher la relation");

			const relation = await app.friendService.searchRelation(user1, user2);
			
			return reply.send(relation);

		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur chercher relation',
				details: err.message });
		}

	})

	app.get('/history', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { user1, user2 } = request.query as { user1?: string, user2?: string };

			if (!user1 || !user2)
				return reply.status(400).send({ error: 'user1 and user2 are required' });

			const user = await app.userService.findByUsername(user2);
			const history = await app.chatService.retrieveChatHistory(user1, user.id);
			return reply.send(history);
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur get /history',
				details: err.message });
		}
	});

	app.post('/block/:relationid', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { relationid } = request.query as { relationid?: number };
			const { userState } = request.body as { userState?: number };

			if (!relationid || ! userState)
				return reply.status(400).send({ error: 'relationid et userState needed' });

			await app.friendService.blockRelation(userState, relationid);
		}
		catch (err: any) {
			return reply.status(500).send({
				error: `erreur changer une relation déjà existante pour bloquer quelqu'un`,
				details: err.message });
		}
	})

	app.post('/blockUser', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { angry, blocked } = request.query as { angry?: string; blocked?: string };

			if (!angry || !blocked)
				return reply.status(400).send({ error: 'blocked et angry needed' });

			await app.friendService.blockUser(angry, blocked);
		}
		catch (err: any) {
			return reply.status(500).send({
				error: `erreur changer une relation déjà existante pour bloquer quelqu'un`,
				details: err.message });
		}
	})

	
}

export default friendRoutes;