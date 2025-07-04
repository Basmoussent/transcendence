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
	time_start: string,
	end_start: string
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

	app.post('/', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("enregistrer une game");

		try {
			const database = db.getDatabase();

			const { id, game_name, player1, player2, player3, player4, winner, time_start, end_start } = request.body;

			if (!game_name)
				throw new Error("You need to precise which game we're talking about");
			if (!player1)
				throw new Error("to create a game it gotta a player at least");
			if (!time_start)
				throw new Error("Precise at what time it started");


			const gameTables = await new Promise<void>((resolve, reject) => {
				database.run(
					'INSERT INTO games (game_name, player1, player2, player3, player4, winner, time_start, end_start) VALUES (?, ?)',
					[game_name, player1, player2, player3, player4, winner, time_start, end_start],
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