import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import path from 'path';

interface stats {
	wins: number,
	pong_games: number,
	block_games: number,
	rating: number
}

interface UserData {
	id: number;
	username: string;
	email: string;
	avatar_url?: string;
	language: string;
	two_fact_auth: boolean;
	secret_key?: string;
}

async function userRoutes(app: FastifyInstance) {
	app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {

		const token = request.headers['x-access-token'] ? request.headers['x-access-token'] : request.cookies['x-access-token'];

		if (!token)
			return reply.status(401).send({ error: 'Token d\'authentification manquant' });

		try {
			const decoded = app.jwt.verify(token) as { user: string };
			const email = decoded.user;

			const database = db.getDatabase();
			if (!database) {
				return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
			}

			// Récupération des données utilisateur
			const user = await new Promise<UserData | null>((resolve, reject) => {
				database.get(
					'SELECT * FROM users WHERE email = ?',
					[email],
					(err: any, row: UserData | undefined) => {
						err ? reject(err) : resolve(row || null);
					}
				);
			});

			if (!user)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });

			console.log('user', user);

			// Récupération des statistiques (pour l'instant des valeurs par défaut)
			// TODO: Implémenter la vraie logique des statistiques
			const userStats = await app.userService.retrieveStats(user.username);
			console.log('userStats', userStats);
			const win = userStats.pong_wins + userStats.block_wins;
			const games = userStats.pong_games + userStats.block_games;
			const rating = userStats.rating;
			const stats = {
				win: win,
				games: games,
				rating: rating
			};

			return reply.send({
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					avatar_url: user.avatar_url || 'avatar.png',
					language: user.language,
					two_fact_auth: user.two_fact_auth || 0,
				},
				stats: stats
			});
		} catch (err: any) {
			console.error('❌ Error in /me endpoint:', err);
			if (err.name === 'JsonWebTokenError') {
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			}
			return reply.status(500).send({ error: 'Erreur serveur interne' });
		}
	});

	app.get('/me2fa', async (request: FastifyRequest, reply: FastifyReply) => {

		const token = request.headers['x-access-token'] ? request.headers['x-access-token'] : request.cookies['x-access-token'];

		if (!token)
			return reply.status(401).send({ error: 'Token d\'authentification manquant' });

		try {
			const decoded = app.jwt2fa.verify(token) as { name: string };
			const username = decoded.name;

			const database = db.getDatabase();
			if (!database) {
				return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
			}

			// Récupération des données utilisateur
			const user = await new Promise<UserData | null>((resolve, reject) => {
				database.get(
					'SELECT * FROM users WHERE username = ?',
					[username],
					(err: any, row: UserData | undefined) => {
						err ? reject(err) : resolve(row || null);
					}
				);
			});

			if (!user)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });

			console.log('user', user);

			// Récupération des statistiques (pour l'instant des valeurs par défaut)
			// TODO: Implémenter la vraie logique des statistiques
			const userStats = await app.userService.retrieveStats(user.username);
			console.log('userStats', userStats);
			const win = userStats.pong_wins + userStats.block_wins;
			const games = userStats.pong_games + userStats.block_games;
			const rating = userStats.rating;
			const stats = {
				win: win,
				games: games,
				rating: rating
			};

			return reply.send({
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					avatar_url: user.avatar_url || 'avatar.png',
					language: user.language,
					two_fact_auth: user.two_fact_auth || 0,
				},
				stats: stats
			});
		} catch (err: any) {
			console.error('❌ Error in /me endpoint:', err);
			if (err.name === 'JsonWebTokenError') {
				return reply.status(401).send({ error: 'Token invalide ou expiré' });
			}
			return reply.status(500).send({ error: 'Erreur serveur interne' });
		}
	});


	app.get('/uploads/:filename', async (request: FastifyRequest, reply: FastifyReply) => {
		const { filename } = request.params as { filename: string };
		const uploadsDir = path.join(__dirname, '../../uploads');
		const filePath = path.join(uploadsDir, filename);

		// Vérifier que le fichier existe
		if (!fs.existsSync(filePath)) {
			return reply.status(404).send({ error: 'Image non trouvée' });
		}

		// Déterminer le type MIME basé sur l'extension
		const ext = path.extname(filename).toLowerCase();
		let contentType = 'image/jpeg'; // par défaut
		if (ext === '.png') contentType = 'image/png';
		else if (ext === '.gif') contentType = 'image/gif';
		else if (ext === '.webp') contentType = 'image/webp';

		// Servir le fichier
		return reply.type(contentType).send(fs.createReadStream(filePath));
	});

	app.post('/upload/avatar', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			const token = request.headers['x-access-token'] ? request.headers['x-access-token'] : request.cookies['x-access-token']; 

			if (!token)
				return reply.status(401).send({ error: 'Token d\'authentification manquant' });

			const decoded = app.jwt.verify(token) as { user: string };
			const email = decoded.user;

			const database = db.getDatabase();
			if (!database)
				return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });

			const user = await new Promise<UserData | null>((resolve, reject) => {
				database.get(
					'SELECT id, username, email, avatar_url, language FROM users WHERE email = ?',
					[email],
					(err: any, row: UserData | undefined) => {
						err ? reject(err) : resolve(row || null);
					}
				);
			});

			if (!user)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });

			const data = await request.file();

			if (!data)
				return reply.status(400).send({ error: 'Aucun fichier reçu' });

			const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

			if (!allowedMimes.includes(data.mimetype))
				return reply.status(400).send({ error: 'Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP' });

			if (data.file.bytesRead > 5 * 1024 * 1024)
				return reply.status(400).send({ error: 'Fichier trop volumineux. Taille maximum: 5MB' });

			const uploadsDir = path.join(__dirname, '../../uploads');

			if (!fs.existsSync(uploadsDir))
				fs.mkdirSync(uploadsDir, { recursive: true });

			const ext = path.extname(data.filename || '') || '.jpg';
			const timestamp = Date.now();
			const filename = `${user.username}_${timestamp}${ext}`;
			const uploadPath = path.join(uploadsDir, filename);

			const writeStream = fs.createWriteStream(uploadPath);
			await new Promise<void>((resolve, reject) => {
				data.file.pipe(writeStream)
					.on('finish', resolve)
					.on('error', reject);
			});

			await new Promise<void>((resolve, reject) => {
				database.run(
					'UPDATE users SET avatar_url = ? WHERE email = ?',
					[filename, email],
					(err: any) => {
						err ? reject(err) : resolve();
					}
				);
			});

			return reply.send({
				message: 'Avatar uploadé avec succès',
				filename: filename,
				avatar_url: `/api/uploads/${filename}`
			});

		}
		catch (err: any) {
			console.error('Erreur pendant l\'upload d\'avatar :', err);
			if (err.name === 'JsonWebTokenError')
				return reply.status(401).send({ error: 'Token invalide ou expiré' });

			return reply.status(500).send({ error: 'Erreur lors de l\'upload de l\'avatar', details: err.message });
		}

	});

	app.get('/user/:userid', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const database = db.getDatabase();

			console.log('apodnaozindoainzdoianzodinazodinazoidn')

			const { userid } = request.query as { userid?: number };

			if (!userid)
				throw new Error("missing userid in the request body");

			const user = await new Promise<UserData | null>((resolve, reject) => {
				database.get(
					'SELECT * FROM users WHERE id = ?',
					[userid],
					(err: any, row: UserData | undefined) => {
						err ? reject(err) : resolve(row || null);
					}
				);
			});
			return reply.send({
				message: `info du user ${userid}`,
				data: user,
			});
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /user:userId',
				details: err.message
			});
		}
	})

	app.get('/user/username/:username', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const database = db.getDatabase();

			const { username } = request.query as { username?: string };

			if (!username)
				throw new Error("missing username in the request body");

			const user = await new Promise<UserData | null>((resolve, reject) => {
				database.get(
					'SELECT * FROM users WHERE username = ?',
					[username],
					(err: any, row: UserData | undefined) => {
						err ? reject(err) : resolve(row || null);
					}
				);
			});
			return reply.send({
				message: `info du user ${username}`,
				data: user,
			});
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /user/username:username',
				details: err.message
			});
		}
	})

	app.put('/username/2fa', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			const database = db.getDatabase();
			const { status, userId } = request.body as { status: boolean, userId: number };

			console.log(`on change la 2fa du user ${userId} on change pour bool = ${status}`)

			await new Promise<void>((resolve, reject) => {
				database.run(
					'UPDATE users SET two_fact_auth = ? WHERE id = ?',
					[status ? 1 : 0, userId],
					function (err: any) {
						err ? reject(err) : resolve();
					})
			})

			reply.send({
				success: true,
				user: {
					userId,
					two_fact_auth: status
				}
			});
		}
		catch (err: any) {
			console.error("pblm change le boolean du user pour la 2FA");
			reply.status(500).send({ success: false, error: 'Erreur lors de la mise à jour 2FA' });
		}
	})

	app.get('/profile/:username', async function (request: FastifyRequest, reply: FastifyReply) {
		const { username } = request.params as { username: string };

		const database = db.getDatabase();
		if (!database)
			return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });

		const user = await new Promise<UserData | null>((resolve, reject) => {
			database.get(
				'SELECT id, username, email, avatar_url, language FROM users WHERE username = ?',
				[username],
				(err: any, row: UserData | undefined) => {
					err ? reject(err) : resolve(row || null);
				}
			);
		});

		if (!user)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });

		const isOnline = await app.userService.isOnline(user.id);

		return reply.send({
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				avatar_url: user.avatar_url || 'avatar.png',
				language: user.language,
				isOnline: isOnline
			}
		});
	})


	app.post('/me/:userid', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { user } = request.body as { user?: any };

			if (!user)
				throw new Error("missing user in the request body");

			try {
				const qrcode = await app.userService.generateQrcode(user);
				return reply.send({
					message: `qr code du user ${user}`,
					qrcode: qrcode
				});
			}
			catch (err: any) {
				console.log(`pblm retrieve la secret key dans le back`)
			}
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /user:userId',
				details: err.message
			});
		}
	})

	app.post('/me/verify-code', async function (request: FastifyRequest, reply: FastifyReply) {

		try {
			const { user, code } = request.body as { user?: any, code: any };

			const database = db.getDatabase();
			console.log(`user = ${user} et code = ${code}`)
			console.log(`request.body = ${JSON.stringify(request.body, null, 8)}`)

			if (!user)
				throw new Error("missing user in the request body");

			if (!code)
				throw new Error("missing code in the request body");

			const secret = await app.userService.findByUsername(user);
			console.log(`secret = ${secret}`)

			try {
				let checkCode = await app.userService.verifiyCode(code, secret.secret_key);
				if (checkCode) {
					const origin = request.headers.origin || '';
					const host = request.headers.host || '';
					let cookieDomain;

					// Log pour debug
					console.log('🔍 Debug cookie domain:', { origin, host });

					if (origin.includes('entropy.local') || host.includes('entropy.local'))
						cookieDomain = '.entropy.local'; // Avec le point pour partager entre sous-domaines
					else if (origin.includes('localhost') || host.includes('localhost')) {
						const hostParts = host.split('.');
						if (hostParts.length > 1)
							cookieDomain = `.${hostParts.slice(-1).join('.')}`; // .localhost
						else
							cookieDomain = ".localhost"; // Pas de domaine pour localhost simple
					}

					console.log(`avant le sign`)
					const token = app.jwt.sign({ user: secret.email, name: secret.username });
					console.log(`après le sign`)
					return reply.header(
						'Set-Cookie',
						`x-access-token=${token}; Path=/; Domain=${cookieDomain}; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`).send({
							checkCode: checkCode
						})
				}

				return reply.send({
					checkCode: checkCode
				});

			}
			catch (err: any) {
				console.log(`pblm verify code`, err)
			}
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /verify-code',
				details: err.message
			});
		}
	})

	app.get('/user/stats/:username', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			const database = db.getDatabase();

			const { username } = request.query as { username?: any };

			if (!username)
				throw new Error("missing username in the request body");
			
			try {
				const result = await app.userService.retrieveStats(username);
				return reply.send({
					message: `stats du user ${username}`,
					stats: result
				});
			}
			catch (err: any) {
				console.log(`pblm retrieve la secret key dans le back`)
			}
		}
		catch (err: any) {
			return reply.status(500).send({
				error: 'erreur GET /user/stats/:username',
				details: err.message
			});
		}
	})
}

export default userRoutes;
