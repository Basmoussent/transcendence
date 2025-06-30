import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import path from 'path';

interface UserData {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  language: string;
}

async function userRoutes(app: FastifyInstance) {
    app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
        // Récupérer le token depuis les headers ou les cookies
        let token = request.headers['x-access-token'] as string;
        
        if (!token) {
          token = request.cookies['x-access-token'];
        }
        
        if (!token) {
            return reply.status(401).send({ error: 'Token d\'authentification manquant' });
        }

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

    // Endpoint pour servir les images uploadées
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

            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'Aucun fichier reçu' });
            }

            const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimes.includes(data.mimetype)) {
                return reply.status(400).send({ error: 'Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP' });
            }

            if (data.file.bytesRead > 5 * 1024 * 1024) {
                return reply.status(400).send({ error: 'Fichier trop volumineux. Taille maximum: 5MB' });
            }

            const uploadsDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

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
                filename: filename,
                avatar_url: `/api/uploads/${filename}`
            });

        } catch (err: any) {
            console.error('Erreur pendant l\'upload d\'avatar :', err);
            if (err.name === 'JsonWebTokenError') {
                return reply.status(401).send({ error: 'Token invalide ou expiré' });
            }
            return reply.status(500).send({ error: 'Erreur lors de l\'upload de l\'avatar', details: err.message });
        }
    });

}

export default userRoutes;