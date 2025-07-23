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

			console.log(game_type, "    ", player1, "    ", users_needed)

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

			// Enrichir les jeux avec les winrates des joueurs
			const gamesWithWinrates = await Promise.all(games?.map(async (game) => {
				const players = [game.player1, game.player2, game.player3, game.player4]
					.filter(player => player && player.trim() !== '');
				
				let totalWinrate = 0;
				let playerCount = 0;
				const playersWithStats = [];

				for (const player of players) {
					try {
						console.log(`recup stats pour ${player}`)
						const stats = await app.userService.retrieveStats(player);
						console.log("stats", stats)
						if (stats) {
							const totalGames = (stats.pong_games || 0) + (stats.block_games || 0);
							const totalWins = (stats.pong_wins || 0) + (stats.block_wins || 0);
							const winrate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
							
							totalWinrate += winrate;
							playerCount++;
							
							playersWithStats.push({
								username: player,
								winrate: winrate
							});
						} else {
							playersWithStats.push({
								username: player,
								winrate: 0
							});
						}
					} catch (error) {
						console.error(`Erreur lors de la récupération des stats pour ${player}:`, error);
						playersWithStats.push({
							username: player,
							winrate: 0
						});
					}
				}

				const averageWinrate = playerCount > 0 ? Math.round(totalWinrate / playerCount) : 0;

				return {
					...game,
					playersWithStats,
					averageWinrate
				};
			}) || []);

			return reply.send({
				message: 'games recu avec succès',
				games: gamesWithWinrates,
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

	app.get('/room/existing/:uuid', async function (request: FastifyRequest, reply: FastifyReply) {
		const { uuid } = request.params as { uuid: string };
		const room = await app.roomService.existingRoom(uuid);
		if (room) {
			return reply.send({
				message: 'room existante',
				room: room,
			});
		}
		else {
			return reply.status(200).send({ error: 'room non trouvée', room: false });
		}
	});

	app.get('/user/:username/history', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			const database = db.getDatabase();
			let { username } = request.params as { username: string };
			const user = await app.userService.findByUsername(username);
			username = user.id;

			if (!username) {
				throw new Error("missing username in the request params");
			}

			const games = await new Promise<Game[]>((resolve, reject) => {
				database.all(
					`SELECT * FROM history 
					WHERE (player1 = ? OR player2 = ? OR player3 = ? OR player4 = ?) 
					ORDER BY end_time DESC 
					LIMIT 20`,
					[username, username, username, username],
					(err: any, rows: Game[] | undefined) => {
						err ? reject(err) : resolve(rows || []);
					}
				);
			});
			console.log("games :", games);

			await Promise.all(games.map(async (game) => {
				if (game.player1) {
					const user = await app.userService.findById(game.player1);
					console.log("user :", user);
					if (user) {
						game.player1 = user.username;
					}
				}
				if (game.player2) {
					game.player2 = (await app.userService.findById(game.player2)).username || game.player2;
				}
				if (game.player3) {
					game.player3 = (await app.userService.findById(game.player3)).username || game.player3;
				}
				if (game.player4) {
					game.player4 = (await app.userService.findById(game.player4)).username || game.player4;
				}
				// Convertir le winner ID en username
				if (game.winner) {
					const winnerUser = await app.userService.findById(game.winner);
					if (winnerUser) {
						game.winner = winnerUser.username;
					}
				}
			}));
			
			return reply.send({
				message: 'success',
				username: user.username,
				games: games,
				total: games.length
			});
		}
		catch (err: any) {
			console.error('erreur GET /games/user/:username/history :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur GET /games/user/:username/history', details: err.message });
		}
	});

	app.post('/finish/:uuid', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			const { uuid } = request.params as { uuid: string };
			const { winner } = request.body as { winner: string };

			if (!uuid || !winner) {
				throw new Error("missing uuid or winner in the request");
			}

			// Convertir le username du gagnant en ID
			let winnerId = winner;
			try {
				// Vérifier si winner est déjà un ID (nombre)
				if (!isNaN(Number(winner))) {
					winnerId = winner;
				} else {
					// Si c'est un username, le convertir en ID
					const winnerUser = await app.userService.findByUsername(winner);
					if (winnerUser) {
						winnerId = winnerUser.id.toString();
					}
				}
			} catch (error) {
				console.error(`Erreur lors de la conversion du winner ${winner} en ID:`, error);
				// En cas d'erreur, garder le username original
				winnerId = winner;
			}

			const success = await app.gameService.moveToHistory(uuid, winnerId);
			
			if (success) {
				return reply.send({
					message: 'Partie terminée et déplacée vers history',
					uuid: uuid,
					winner: winner
				});
			} else {
				return reply.status(500).send({ error: 'Erreur lors de la finalisation de la partie' });
			}
		}
		catch (err: any) {
			console.error('erreur POST /games/finish/:uuid :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur POST /games/finish/:uuid', details: err.message });
		}
	});

	app.post('/tournament', async function (request: FastifyRequest, reply: FastifyReply) {

		try {

			const uuid = uuidv4();
			const { player1, player2, winner, start_time } = request.body as { player1: string, player2: string, winner: string, start_time: string};


			if (!uuid || !uuidValidate(uuid))
				throw new Error("missing uuid OR invalid uuid");

			if (!player1 ||  !player2 ||  !winner || !start_time )
				throw new Error("un des 5 manquants !player1 ||  !player2 ||  !winner || !start_time || !end_time");

			const user1 = await app.userService.findByUsername(player1);
			const user2 = await app.userService.findByUsername(player2);
			
			let winnerId = winner;
			try {
				const winnerUser = await app.userService.findByUsername(winner);
				if (winnerUser) {
					winnerId = winnerUser.id.toString();
				}
			} catch (error) {
				console.error(`Erreur lors de la conversion du winner ${winner} en ID:`, error);
				winnerId = winner;
			}
			
			const success = await app.gameService.logTournamentGame(uuid, user1.id, user2.id, winnerId, start_time);
			
			if (success) {
				return reply.send({
					message: 'partie de tournoi terminee et log dans la table history',
					uuid: uuid,
					winner: winner
				});
			}
			else
				return reply.status(500).send({ error: 'Erreur lors de la finalisation de la partie DES TOURNOIS' });
		}
		catch (err: any) {
			console.error('erreur POST /games/finish/:uuid :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur POST /games/finish/:uuid', details: err.message });
		}

	})
}


export default gameRoutes;