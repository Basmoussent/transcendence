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

	app.post('/', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { user_1, user_2, user1_state, user2_state } = request.body as { user_1?: number, user_2?: number, user1_state?: string, user2_state?: string };

			console.log("aozdnaiuzndiauzndiazndiuazdiuandi")
			console.log(user_1, " ", user_2, " ", user1_state, " ", user2_state);

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

	app.post('/:id', async function (request: FastifyRequest, reply: FastifyReply) {

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
			const { user1, user2,} = request.body as { user1?: number, user2?: number };

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
			const { user2 } = request.query as { user2?: string };
			const token = request.headers['x-access-token'] ? request.headers['x-access-token'] : request.cookies['x-access-token'];

			if (!token)
				return reply.status(401).send({ error: 'Token d\'authentification manquant' });

			if (!user2)
				return reply.status(400).send({ error: 'user2 is required' });

			// Récupérer l'ID de l'utilisateur connecté depuis le token
			const decoded = app.jwt.verify(token as string) as { user: string, name: string };
			const user1Username = decoded.name;
			console.log("user1Username", user1Username);
			const user1data = await app.userService.findByUsername(user1Username);
			
			if (!user1data) {
				return reply.status(404).send({ error: 'Utilisateur connecté non trouvé' });
			}

			const user2data = await app.userService.findByUsername(user2);
			if (!user2data) {
				return reply.status(404).send({ error: 'Utilisateur 2 non trouvé' });
			}

			const history = await app.chatService.retrieveChatHistory(user1data.id, user2data.id);
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
			const { angry, blocked } = request.query as { angry?: number; blocked?: number };

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