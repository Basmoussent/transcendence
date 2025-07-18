import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { redis } from '../index';


export interface Game {
	id: number,
	uuid: string,
	game_type: string,
	player1: string,
	player2: string,
	player3: string,
	player4: string,
	winner: string,
	users_needed: number,
	start_time: string,
	end_time: string
}

interface BodyType {
	game_type:string,
	player1: string,
	users_needed:string,
}

// check que ca soit plus surligne typage request.body

async function gameRoutes(app: FastifyInstance) {

	app.get('/:uuid', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("recuperer une game");

		try {
			const database = db.getDatabase();

			const { uuid } = request.query as { uuid?: string };

			console.log(`le uuid ${uuid}`)

			if (!uuid)
				throw new Error ("missing uuid in the request query");

			const game = await new Promise<Game | null>((resolve, reject) => {

				database.get(
					'SELECT * FROM games WHERE uuid = ?',
					[ uuid ],
					(err: any, row: Game | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			console.log("game", game);

			return reply.send({
				message: 'game recu avec succès',
				game: game,
			});
		}

		catch (err: any) {
			console.error('erreur GET /games :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur GET /games', details: err.message });
		}

	})

	app.post('/', async function (request: FastifyRequest<{ Body: BodyType }>, reply: FastifyReply) {

		console.log("enregistrer une game");

		try {
			const database = db.getDatabase();

			let uuid = uuidv4(); // id de la room
			const { game_type, player1, users_needed } = request.body;

			if (!uuidValidate(uuid) || !game_type || !player1 || !users_needed)
				throw new Error("Mandatory info needed to prelog game");

			await new Promise<void>((resolve, reject) => {
				database.run(
					'INSERT INTO games (uuid, game_type, player1, users_needed) VALUES (?, ?, ?, ?)',
					[uuid, game_type, player1, users_needed],
					(err: any) => {
						err ? reject(err) : resolve(); },
				);
			});

			return reply.send({
				uuid: uuid,
			});
		}

		catch (err: any) {
			console.error('erreur POST /games :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur POST /games', details: err.message });
		}

	})

	app.put('/', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			const database = db.getDatabase();

			const { gameId, ...fields } = request.body;

			if (!gameId) throw new Error("gameId est obligatoire pour la mise à jour");

			// Garde uniquement les champs définis (non null, non undefined)
			const keys = Object.keys(fields).filter(key => fields[key] !== undefined && fields[key] !== null);

			if (keys.length === 0)
				return reply.send({ message: "Aucun champ à mettre à jour." });

			// Construis la partie SET de la requête dynamique : "col1 = ?, col2 = ?, ..."
			const setClause = keys.map(key => `${key} = ?`).join(', ');

			// Prépare les valeurs correspondantes dans le même ordre
			const values = keys.map(key => fields[key]);

			// Ajoute gameId à la fin pour la clause WHERE
			values.push(gameId);

			const sql = `UPDATE games SET ${setClause} WHERE id = ?`;

			await new Promise<void>((resolve, reject) => {
				database.run(sql, values, (err: any) => {
					err ? reject(err) : resolve();
				});
			});

			return reply.send({
				message: 'Update réussie',
			});
		}
		catch (err: any) {
			console.error('erreur PUT /games', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur PUT /games', details: err.message });
		}
	});

	app.get('/available', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const database = db.getDatabase();

			const games = await new Promise<Game[] | null>((resolve, reject) => {

				database.all(
					'SELECT * FROM games where start_time IS NULL',
					(err: any, row: Game[] | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			return reply.send({
				message: 'games recu avec succès',
				games: games,
			});
		}

		catch (err: any) {
			console.error('pblm GET /games//available :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'pblm GET /games/available', details: err.message });
		}

	})

	app.get('/specific', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("récupérer une game precise games");

		try {
			const database = db.getDatabase();

			const { gameId } = request.query as { gameId?: string};

			if (!gameId)
				throw new Error ("missing gameId in the request body");

			const game = await new Promise<Game | null>((resolve, reject) => {

				database.get(
					'SELECT * FROM games WHERE id = ?',
					[ gameId ],
					(err: any, row: Game | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			return reply.send({
				message: 'Voici la game demande',
				game: game,
			});
		}

		catch (err: any) {
			console.error('erreur GET /games/specific :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur GET /games/specific :', details: err.message });
		}

	})

	// fonctionne comme il faut
	app.get('/room/:uuid', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("récupérer une game precise games");

		try {
			const database = db.getDatabase();
``
			const { uuid } = request.query as { uuid?: string };

			if (!uuid)
				throw new Error ("missing uuid in the request query");

			const game = await new Promise<Game | null>((resolve, reject) => {

				database.get(
					'SELECT * FROM games WHERE uuid = ?',
					[ uuid ],
					(err: any, row: Game | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			return reply.send({
				message: 'acceder a la room par uuid',
				game: game,
			});
		}

		catch (err: any) {
			console.error('erreur GET /games :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur GET /games', details: err.message });
		}

	})

}



export default gameRoutes;