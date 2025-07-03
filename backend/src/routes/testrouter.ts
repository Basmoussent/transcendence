import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import path from 'path';

interface Drinks {
	id: number,
	drink_name: string,
	cost: number
}

interface BarTables {
	id: number,
	user_tab: String[],
	drinks_tab: Drinks[],
	total_cost: number
}

async function barRoutes(app: FastifyInstance) {
	app.get('/', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("route game/start appexxxlee");
		try {
			const database = db.getDatabase();

			const barTables = await new Promise<BarTables[] | null>((resolve, reject) => {
				database.get(
					'SELECT * FROM barTables',
					(err: any, row: BarTables[] | undefined) => {
						if (err) {
							reject(err);
						} else {
							resolve(row || null);
						}
					}
				);
			});
			console.log("barTables", barTables)
			// await new Promise<void>((resolve, reject) => {
			// 	database.run(
			// 		'INSERT INTO games (status, player1, player2) VALUES (?, ?, ?)',
			// 		['ongoing', user.username, player2],
			// 		(err: any) => {
			// 			if (err) {
			// 				reject(err);
			// 			} else {
			// 				resolve();
			// 			}
			// 		}
			// 	);
			// });


			return reply.send({
				message: 'barTables recu avec succès',
				barTables: barTables,
			});

		} catch (err: any) {
			console.error('Erreur pendant l\'upload d\'avatar :', err);
			if (err.name === 'JsonWebTokenError') {
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			}
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}
	});

	app.post('/', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("route post table called");
		try {
			const database = db.getDatabase();
			const { users, drinks_tab } = request.body;

			console.log("BODY table RECU:", request.body);

			if (!prix || !intprix)
				throw new Error("pas de price");
			if (!drink_name)
				throw new Error("pas de drink_name");



			await new Promise<void>((resolve, reject) => {
				database.run(
					'INSERT INTO drinks (drink_name, cost) VALUES (?, ?)',
					[drink_name, intprix],
					(err: any) => {
						if (err) {
							console.log(err)
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});



			return reply.send({
				message: 'drinks envoyee avec succès',
			});

		} catch (err: any) {
			console.error('drink post error', err);
			if (err.name === 'JsonWebTokenError') {
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			}
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}
	});

	app.get('/drinks', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("route drinks called");
		try {
			const database = db.getDatabase();

			const drinkTables = await new Promise<Drinks[] | null>((resolve, reject) => {
				database.all(
					'SELECT * FROM drinks',
					(err: any, row: Drinks[] | undefined) => {
						if (err) {
							reject(err);
						} else {
							resolve(row || null);
						}
					}
				);
			});
			console.log("drinks", drinkTables)

			return reply.send({
				message: 'drinks recu avec succès',
				drinks: drinkTables,
			});

		} catch (err: any) {
			console.error('Erreur pendant l\'upload d\'avatar :', err);
			if (err.name === 'JsonWebTokenError') {
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			}
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}
	});



	app.post('/drinks', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("route post drinks called");
		try {
			const database = db.getDatabase();
			const { prix, drink_name } = request.body;

			console.log("BODY RECU:", request.body);

			const intprix = parseFloat(prix);

			if (!prix || !intprix)
				throw new Error("pas de price");
			if (!drink_name)
				throw new Error("pas de drink_name");

			// checker qu'elle existe pas deja
			const exists = await new Promise<Drinks | null>((resolve, reject) => {
				database.get(
					'SELECT * FROM drinks WHERE drink_name = ?', [drink_name],
					(err: any, row: Drinks | undefined) => {
						if (err) {
							reject(err);
						} else {
							resolve(row || null);
						}
					}

				);
			}
			);
			if (exists)
				throw new Error("La boisson existe deja au prix de " + exists.cost)

			await new Promise<void>((resolve, reject) => {
				database.run(
					'INSERT INTO drinks (drink_name, cost) VALUES (?, ?)',
					[drink_name, intprix],
					(err: any) => {
						if (err) {
							console.log(err)
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});



			return reply.send({
				message: 'drinks envoyee avec succès',
			});

		} catch (err: any) {
			console.error('drink post error', err);
			if (err.name === 'JsonWebTokenError') {
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			}
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}
	});

	app.delete('/drinks', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("route delete drinks called");
		try {
			const database = db.getDatabase();

			const { drink_name } = request.body;

			await new Promise<void>((resolve, reject) => {
				database.run(
					'DELETE FROM drinks WHERE drink_name = ?', [drink_name],
					(err: any) => {
						if (err) {
							console.log(err)
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});
			console.log("drinks deleted")

			return reply.send({
				message: 'drinks supprime avec succès',
			});

		} catch (err: any) {
			console.error('Erreur pendant l\'upload d\'avatar :', err);
			if (err.name === 'JsonWebTokenError') {
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			}
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}
	});



	// app.post('/end', async function (request: FastifyRequest, reply: FastifyReply) {

	// 	console.log("route game/start appexxxlee");
	// 	try {
	// 		let token = request.headers['x-access-token'] as string;
	// 		if (!token) {
	// 			token = request.cookies['x-access-token'];
	// 		}

	// 		if (!token) {
	// 			return reply.status(401).send({ error: 'Token d\'authentification manquant' });
	// 		}

	// 		const decoded = app.jwt.verify(token) as { user: string };
	// 		const email = decoded.user;

	// 		const database = db.getDatabase();
	// 		if (!database) {
	// 			return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
	// 		}

	// 		const user = await new Promise<UserData | null>((resolve, reject) => {
	// 			database.get(
	// 				'SELECT id, username, email, avatar_url, language FROM users WHERE email = ?',
	// 				[email],
	// 				(err: any, row: UserData | undefined) => {
	// 					if (err) {
	// 						reject(err);
	// 					} else {
	// 						resolve(row || null);
	// 					}
	// 				}
	// 			);
	// 		});

	// 		if (!user) {
	// 			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
	// 		}

	// 		const { winner, score } = request.body;
	// 		console.log("whole body", request.body);

	// 		await new Promise<void>((resolve, reject) => {
	// 			database.run(
	// 				'UPDATE games SET status = ?, score = ?, winner = ? WHERE id = ?',
	// 				["sadasdsdsadsdjashjashdkjash", score, winner, 1],
	// 				(err: any) => {
	// 					if (err) {
	// 						reject(err);
	// 					} else {
	// 						resolve();
	// 					}
	// 				}
	// 			);
	// 		});


	// 		return reply.send({
	// 			message: 'Avatar uploadé avec succès',
	// 		});

	// 	} catch (err: any) {
	// 		console.error('Erreur pendant l\'uxxxxxxxxpload d\'avatar :', err);
	// 		if (err.name === 'JsonWebTokenError') {
	// 			return reply.status(401).send({ error: 'Token invalide ou expiré' });
	// 		}
	// 		return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
	// 	}
	// });

}

export default barRoutes;