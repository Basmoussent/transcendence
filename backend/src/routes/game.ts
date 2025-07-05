import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import path from 'path';

interface GameTables {
	id: number,
	game_name: string,
	player1: string,
	player2: string,
	player3: string,
	player4: string,
	winner: string,
	start_time: string,
	end_time: string
}

async function gameRoutes(app: FastifyInstance) {

	app.get('/', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("get sur /games renvoie toutes les games enregistrees");

		try {
			const database = db.getDatabase();

			const gameTables = await new Promise<GameTables[] | null>((resolve, reject) => {

				database.get(
					'SELECT * FROM games',
					(err: any, row: GameTables[] | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			console.log("gameTables", gameTables);

			return reply.send({
				message: 'gameTables recu avec succès',
				gameTables: gameTables,
			});
		}

		catch (err: any) {
			console.error('Erreur retrieve game tables :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}

	})

	app.post('/start-game', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("enregistrer une game");

		try {
			const database = db.getDatabase();

			const { game_name, player1} = request.body;

			if (!game_name)
				throw new Error("You need to precise which game we're talking about");
			if (!player1)
				throw new Error("to create a game it gotta a player at least");

			const gameTables = await new Promise<void>((resolve, reject) => {
				database.run(
					'INSERT INTO games (game_name, player1) VALUES (?, ?)',
					[game_name, player1],
					(err: any) => {
						err ? reject(err) : resolve(); }
				);
			});

			return reply.send({
				message: 'post une game avec succès',
			});
		}

		catch (err: any) {
			console.error('Erreur retrieve game tables :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}

	})

	app.post('end-game', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("mettre a jour la game");

		try {
			const database = db.getDatabase();

			const { game_name, player1, start_time } = request.body;

			if (!game_name)
				throw new Error("You need to precise which game we're talking about");
			if (!player1)
				throw new Error("to create a game it gotta a player at least");
			if (!start_time)
				throw new Error("Precise at what time it started");


			const gameTables = await new Promise<void>((resolve, reject) => {
				database.run(
					'INSERT INTO games (game_name, player1, start_time) VALUES (?, ?, ?)',
					[game_name, player1, start_time],
					(err: any) => {
						err ? reject(err) : resolve(); }
				);
			});

			return reply.send({
				message: 'post une game avec succès',
			});
		}

		catch (err: any) {
			console.error('Erreur retrieve game tables :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
		}

	})
}



export default gameRoutes;