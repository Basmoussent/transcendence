import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import sqlite3 from 'sqlite3';
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

		console.log("récupérer toute les games");

		try {
			const database = db.getDatabase();

			const gameTables = await new Promise<GameTables[] | null>((resolve, reject) => {

				database.all(
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
			console.error('erreur GET /games :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur GET /games', details: err.message });
		}

	})

	app.post('/', async function (request: FastifyRequest, reply: FastifyReply) {

		console.log("enregistrer une game");

		try {
			const database = db.getDatabase();

			const { game_name, chef, player1, users_needed } = request.body;


			if (!game_name || !chef || !player1 || !users_needed)
				throw new Error("Mandatory info needed to prelog game");

			const gameId = await new Promise<void>((resolve, reject) => {
				database.run(
					'INSERT INTO games (game_name, chef, player1, users_needed) VALUES (?, ?, ?, ?)',
					[game_name, chef, player1, users_needed],
					(err: any) => {
						err ? reject(err) : resolve(); },
					database.get('SELECT last_insert_rowid() as id', (err: any, row: any) => {
						err ? reject(err) : resolve(row.id); })
				);
			});

			return reply.send({
				message: 'crée une game avec succès',
				gameId: gameId,
			});
		}

		catch (err: any) {
			console.error('erreur PUT /games :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			return reply.status(500).send({ error: 'erreur PUT /games', details: err.message });
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

		console.log("récupérer qui attendent de pouvoir se lancer");

		try {
			const database = db.getDatabase();

			const games = await new Promise<GameTables[] | null>((resolve, reject) => {

				database.all(
					'SELECT * FROM games where start_time IS NULL',
					(err: any, row: GameTables[] | undefined) => {
						err ? reject(err) : resolve(row || null); }
				);
			});
			console.log("games", games);

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

}



export default gameRoutes;