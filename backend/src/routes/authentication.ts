import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import { generateBase32Key } from './utils';


// Interfaces pour le typage TypeScript
interface LoginBody {
	username: string;
	password: string;
}

interface RegisterBody {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface User {
	id: number;
	username: string;
	email: string;
	password_hash: string;
	avatar_url?: string;
	language: string;
	created_at: string;
}

async function authRoutes(app: FastifyInstance) {
	/**
	 * Route d'inscription (Register)
	 * POST /auth/register
	 * 
	 * Cette route permet de créer un nouveau compte utilisateur.
	 * Elle vérifie :
	 * 1. Que tous les champs requis sont présents
	 * 2. Que les mots de passe correspondent
	 * 3. Que l'utilisateur n'existe pas déjà (username ou email unique)
	 */
	app.post<{ Body: RegisterBody }>('/register', async (request: FastifyRequest, reply: FastifyReply) => {
		// Extraction des données du corps de la requête
		const { username, email, password, confirmPassword } = request.body;

		// Validation des champs requis
		if (!username || !email || !password || !confirmPassword)
			return reply.status(400).send({ error: 'Tous les champs sont obligatoires' });

		// // Validation de la longueur du nom d'utilisateur
		// if (username.length < 3) {
		//   return reply.status(400).send({ error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' });
		// }

		// // Validation de la longueur du mot de passe
		// if (password.length < 6) {
		//   return reply.status(400).send({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
		// }

		// // Validation du format email
		// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		// if (!emailRegex.test(email)) {
		//   return reply.status(400).send({ error: 'Format d\'email invalide' });
		// }

		// Vérification que les mots de passe correspondent
		if (password !== confirmPassword)
			return reply.status(400).send({ error: 'Les mots de passe ne correspondent pas' });

		// Récupération de la connexion à la base de données
		const datab = db.getDatabase();

		// Vérification si l'utilisateur existe déjà
		const cleanUsername = username.trim().toLowerCase();
		const cleanEmail = email.trim().toLowerCase();

		const existingUser = await new Promise<User | null>((resolve, reject) => {
			datab.get(
				'SELECT username, email FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?',
				[cleanUsername, cleanEmail],
				(err: any, user: User | undefined) => {//REPASSER
					if (err)
						reject(err);
					else
						resolve(user || null);
				}
			);
		});
		console.log('existingUser', existingUser);

		if (existingUser) {
			if (existingUser.username.toLowerCase() === cleanUsername)
				return reply.status(409).send({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
			else if (existingUser.email.toLowerCase() === cleanEmail)
				return reply.status(409).send({ error: 'Cette adresse email est déjà utilisée' });
		}

		// Hashage du mot de passe avec bcrypt (10 tours de hachage)
		const password_hash = await bcrypt.hash(password, 10);
		const secret_key = generateBase32Key();

		try {

			// Préparation et exécution de la requête SQL d'insertion
			const stmt = datab.prepare(
				`INSERT INTO users (username, email, password_hash, secret_key)
				 VALUES (?, ?, ?, ?)`
			);

			stmt.run(cleanUsername, cleanEmail, password_hash, secret_key);

			return reply.status(201).send({ message: 'Compte créé avec succès' });
		} catch (err: any) {
			console.error('❌ Error inserting user:', err);
			return reply.status(500).send({ error: 'Erreur interne du serveur' });
		}

	});

	/**
	 * Route de connexion (Login)
	 * POST /auth/login
	 * 
	 * Cette route permet à un utilisateur de se connecter.
	 * Elle vérifie :
	 * 1. Que les champs requis sont présents
	 * 2. Que l'utilisateur existe
	 * 3. Que le mot de passe est correct
	 */
	app.post<{ Body: LoginBody }>('/login', async (request: FastifyRequest, reply: FastifyReply) => {
		// Extraction des données du corps de la requête
		const { username, password } = request.body;

		// Vérification de la présence des champs requis
		if (!username || !password)
			return reply.status(400).send({ error: 'Username and password are required' });

		// Récupération de la connexion à la base de données
		const database = db.getDatabase();

		// Vérification que la base de données est initialisée
		if (!database) {
			console.error('❌ Database not initialized');
			return reply.status(500).send({ error: 'Database connection error' });
		}

		// Utilisation d'une Promise pour gérer l'asynchronicité de la requête SQL
		return new Promise((resolve, reject) => {
			// Recherche de l'utilisateur dans la base de données
			database.get(
				'SELECT * FROM users WHERE username = ?',
				[username],
				async (err: any, user: User | undefined) => {
					// Gestion des erreurs de base de données
					if (err) {
						console.error('❌ Database error:', err);
						resolve(reply.status(500).send({ error: 'Database error' }));
						return;
					}

					// Log pour le débogage
					console.log('🔍 Debug - Raw user object:', user);

					// Vérification que l'utilisateur existe
					if (!user) {
						resolve(reply.status(401).send({ error: 'Invalid username or password' }));
						return;
					}

					// Vérification que le hash du mot de passe existe
					if (!user.password_hash) {
						console.error('❌ User found but password_hash is missing');
						console.error('❌ Full user object:', JSON.stringify(user, null, 2));
						resolve(reply.status(500).send({ error: 'Internal server error' }));
						return;
					}

					try {
						const passwordMatch = await bcrypt.compare(password, user.password_hash);

						if (!passwordMatch) {
							resolve(reply.status(401).send({ error: 'Invalid username or password' }));
							return;
						}

						const info = await app.userService.findByUsername(user.username);
						const response = reply
							.status(200)

						if (info.two_fact_auth) {
							
							if (!app.jwt2fa) {
								console.error('❌ jwt2fa decorator is not available!');
								resolve(reply.status(500).send({ error: 'JWT 2FA not configured' }));
								return;
							}
							
							const tfa_token = app.jwt2fa.sign({ name: user.username });
							response.header(
								"x-access-token", tfa_token
							);
							resolve(response.send({
								message: "2FA needed",
								user: {
									id: user.id,
									username: user.username,
									email: user.email
								}
							}))
							return;
						}
						else {
							console.warn(`bool 2fa ${info.two_fact_auth}`)
							const token = app.jwt.sign({ user: user.email, name: user.username });

							response.header(
								"x-access-token", token
							);

							resolve(response.send({
								message: "Login successful",
								user: {
									id: user.id,
									username: user.username,
									email: user.email
								}
							}));
						}
					} catch (error) {
						// Gestion des erreurs lors de la comparaison des mots de passe
						console.error('❌ Error comparing passwords:', error);
						resolve(reply.status(500).send({ error: 'Internal server error' }));
					}
				}
			);
		});
	});

	/**
	 * Route de déconnexion (Logout)
	 * POST /auth/logout
	 * 
	 * Cette route permet à un utilisateur de se déconnecter.
	 * Elle supprime le token d'authentification.
	 */
	app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			return reply.status(200).send({ message: 'Logout successful' });
		} catch (error) {
			console.error('❌ Error during logout:', error);
			return reply.status(500).send({ error: 'Internal server error' });
		}
	});

	app.get('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
		let token = request.headers['x-access-token'] as string;

		if (!token)
			return reply.status(401).send({ error: 'Token d\'authentification manquant' });

		try {
			const decoded = app.jwt.verify(token);
			return { valid: true, payload: decoded, temp: false };
		}
		catch (err) {
			try {
				const tfa_decoded = app.jwt2fa.verify(token);
				return { valid: true, payload: tfa_decoded, temp: true };
			}
			catch (err: any) {
				return reply.status(401).send({ error: 'Invalid token', detail: err.message });
			}
		}
	});

}

export default authRoutes;
