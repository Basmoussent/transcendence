import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import fastify from '../index';
import User from './authentication';

interface UserData {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  language: string;
}

async function userRoutes(app: FastifyInstance) {
    app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
        const token = request.headers['x-access-token'] as string;
        if (!token) {
            return reply.status(401).send({ error: 'Token d\'authentification manquant' });
        }

        try {
            const decoded = fastify.jwt.verify(token) as { user: string };
            const username = decoded.user;

            const database = db.getDatabase();
            if (!database) {
                return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
            }

            // Récupération des données utilisateur
            const user = await new Promise<UserData | null>((resolve, reject) => {
                database.get(
                    'SELECT id, username, email, avatar_url, language FROM users WHERE username = ?',
                    [username],
                    (err: any, row: UserData | undefined) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row || null);
                        }
                    }
                );
            });

            if (!user) {
                return reply.status(404).send({ error: 'Utilisateur non trouvé' });
            }

            // Récupération des statistiques (pour l'instant des valeurs par défaut)
            // TODO: Implémenter la vraie logique des statistiques
            const stats = {
                wins: 0,
                games: 0,
                rating: 0
            };

            return reply.send({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar_url: user.avatar_url || 'avatar.png',
                    language: user.language
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
}

export default userRoutes;