import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import path from 'path';

interface Game {
    id: number;
    player1: string;
    score1: string;
    player2: string;
    score2: string;
    winner: string | null;
    status: "started" | "finished" | "ff'ed"
}

interface UserData {
    id: number;
    username: string;
    email: string;
    avatar_url?: string;
    language: string;
}

async function gameRoutes(app: FastifyInstance) {
    //    app.post('/start', async function (request: FastifyRequest, reply: FastifyReply) {

    //     console.log("route game/start appexxxlee");
    //     try {
    //         let token = request.headers['x-access-token'] as string;
    //         if (!token) {
    //             token = request.cookies['x-access-token'];
    //         }

    //         if (!token) {
    //             return reply.status(401).send({ error: 'Token d\'authentification manquant' });
    //         }

    //         const decoded = app.jwt.verify(token) as { user: string };
    //         const email = decoded.user;

    //         const database = db.getDatabase();
    //         if (!database) {
    //             return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
    //         }

    //         const user = await new Promise<UserData | null>((resolve, reject) => {
    //             database.get(
    //                 'SELECT id, username, email, avatar_url, language FROM users WHERE email = ?',
    //                 [email],
    //                 (err: any, row: UserData | undefined) => {
    //                     if (err) {
    //                         reject(err);
    //                     } else {
    //                         resolve(row || null);
    //                     }
    //                 }
    //             );
    //         });

    //         if (!user) {
    //             return reply.status(404).send({ error: 'Utilisateur non trouvé' });
    //         }

    //         const allGamesOfUser = await new Promise<UserData | null>((resolve, reject) => {
    //             database.get(
    //                 'SELECT * FROM games WHERE player1 = ?', [user.id],
    //                 (err: any, row: UserData | undefined) => {
    //                     if (err) {
    //                         reject(err);
    //                     } else {
    //                         resolve(row || null);
    //                     }
    //                 }
    //             );
    //         });
    //         console.log("allGamesOfUser", allGamesOfUser)
    //         return reply.send({ 
    //             message: 'Avatar uploadé avec succès',
    //             allGamesOfUser:allGamesOfUser,
    //         });

    //     } catch (err: any) {
    //         console.error('Erreur pendant l\'upload d\'avatar :', err);
    //         if (err.name === 'JsonWebTokenError') {
    //             return reply.status(401).send({ error: 'Token invalide ou expiré' });
    //         }
    //         return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
    //     }
    // });
    app.post('/start', async function (request: FastifyRequest, reply: FastifyReply) {

        console.log("route game/start appexxxlee");
        try {
            let token = request.headers['x-access-token'] as string;
            if (!token) {
                token = request.cookies['x-access-token'];
            }

            if (!token) {
                return reply.status(401).send({ error: 'Token d\'authentification manquant' });
            }

            const decoded = app.jwt.verify(token) as { user: string };
            const email = decoded.user;

            const database = db.getDatabase();
            if (!database) {
                return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
            }

            const user = await new Promise<UserData | null>((resolve, reject) => {
                database.get(
                    'SELECT id, username, email, avatar_url, language FROM users WHERE email = ?',
                    [email],
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

            const { player2 } = request.body;
            console.log("player2", player2);


            const allusersindb = await new Promise<UserData | null>((resolve, reject) => {
                database.get(
                    'SELECT * FROM users',
                    (err: any, row: UserData | undefined) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row || null);
                        }
                    }
                );
            });
            console.log("allusersindb", allusersindb)
            await new Promise<void>((resolve, reject) => {
                database.run(
                    'INSERT INTO games (status, player1, player2) VALUES (?, ?, ?)',
                    ['ongoing', user.username, player2],
                    (err: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });


            return reply.send({
                message: 'Avatar uploadé avec succès',
            });

        } catch (err: any) {
            console.error('Erreur pendant l\'upload d\'avatar :', err);
            if (err.name === 'JsonWebTokenError') {
                return reply.status(401).send({ error: 'Token invalide ou expiré' });
            }
            return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
        }
    });

    app.post('/end', async function (request: FastifyRequest, reply: FastifyReply) {

        console.log("route game/start appexxxlee");
        try {
            let token = request.headers['x-access-token'] as string;
            if (!token) {
                token = request.cookies['x-access-token'];
            }

            if (!token) {
                return reply.status(401).send({ error: 'Token d\'authentification manquant' });
            }

            const decoded = app.jwt.verify(token) as { user: string };
            const email = decoded.user;

            const database = db.getDatabase();
            if (!database) {
                return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
            }

            const user = await new Promise<UserData | null>((resolve, reject) => {
                database.get(
                    'SELECT id, username, email, avatar_url, language FROM users WHERE email = ?',
                    [email],
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

            const { winner, score } = request.body;
            console.log("whole body", request.body);

            await new Promise<void>((resolve, reject) => {
                database.run(
                    'UPDATE games SET status = ?, score = ?, winner = ? WHERE id = ?',
                    ["sadasdsdsadsdjashjashdkjash", score, winner, 1],
                    (err: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });


            return reply.send({
                message: 'Avatar uploadé avec succès',
            });

        } catch (err: any) {
            console.error('Erreur pendant l\'uxxxxxxxxpload d\'avatar :', err);
            if (err.name === 'JsonWebTokenError') {
                return reply.status(401).send({ error: 'Token invalide ou expiré' });
            }
            return reply.status(500).send({ error: 'Erreur lors de cxxxl\'upload de l\'avatar', details: err.message });
        }
    });

}

export default gameRoutes;