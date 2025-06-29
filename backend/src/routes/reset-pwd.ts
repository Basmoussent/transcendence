import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface EditProfileBody {
  username: string;
  avatar: string;
}

interface ChangeLanguageBody {
  language: string;
}

async function editRoutes(app: FastifyInstance) {
  app.post<{ Body: ChangePasswordBody }>('/change-password', async (request: FastifyRequest<{ Body: ChangePasswordBody }>, reply: FastifyReply) => {
    try {
      // Récupérer le token depuis les headers ou les cookies
      let token = request.headers['x-access-token'] as string;
      
      if (!token) {
        token = request.cookies['x-access-token'];
      }
      
      if (!token) {
        return reply.code(401).send({ error: 'Token manquant' });
      }

      const payload = app.jwt.verify(token) as { user: string };
      const email = payload.user;
      const { currentPassword, newPassword, confirmNewPassword } = request.body;

      if (newPassword !== confirmNewPassword) {
        return reply.code(400).send({ error: 'Les nouveaux mots de passe ne correspondent pas' });
      }

      if (currentPassword === newPassword) {
        return reply.code(400).send({ error: 'Le nouveau mot de passe doit être différent de l\'ancien' });
      }

      const isCurrentPasswordValid = await verifyCurrentPassword(email, currentPassword);
      if (!isCurrentPasswordValid) {
        return reply.code(401).send({ error: 'Mot de passe actuel incorrect' });
      }

      await updatePassword(email, newPassword);

      reply.send({ success: true, message: 'Mot de passe modifié avec succès' });
    } catch (err: any) {
      console.error('❌ Error in change-password:', err);
      if (err.name === 'JsonWebTokenError') {
        return reply.code(401).send({ error: 'Token invalide ou expiré' });
      }
      reply.code(500).send({ error: 'Erreur serveur interne' });
    }
  });

      // Endpoint pour mettre à jour le profil (username et avatar_url)
      app.post('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Vérifier l'authentification
            let token = request.headers['x-access-token'] as string;
            if (!token) {
                token = request.cookies['x-access-token'];
            }
            
            if (!token) {
                return reply.status(401).send({ error: 'Token d\'authentification manquant' });
            }

            const decoded = app.jwt.verify(token) as { user: string };
            const email = decoded.user;

            const { username, avatar_url } = request.body as { username?: string; avatar_url?: string };

            const database = db.getDatabase();
            if (!database) {
                return reply.status(500).send({ error: 'Erreur de connexion à la base de données' });
            }

            if (username && avatar_url) {
                await new Promise<void>((resolve, reject) => {
                    database.run(
                        'UPDATE users SET username = ?, avatar_url = ? WHERE email = ?',
                        [username, avatar_url, email],
                        (err: any) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            } else if (username) {
                await new Promise<void>((resolve, reject) => {
                    database.run(
                        'UPDATE users SET username = ? WHERE email = ?',
                        [username, email],
                        (err: any) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            } else if (avatar_url) {
                await new Promise<void>((resolve, reject) => {
                    database.run(
                        'UPDATE users SET avatar_url = ? WHERE email = ?',
                        [avatar_url, email],
                        (err: any) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            }

            return reply.send({ message: 'Profil mis à jour avec succès' });

        } catch (err: any) {
            console.error('Erreur lors de la mise à jour du profil :', err);
            if (err.name === 'JsonWebTokenError') {
                return reply.status(401).send({ error: 'Token invalide ou expiré' });
            }
            return reply.status(500).send({ error: 'Erreur lors de la mise à jour du profil' });
        }
    });

  app.post<{ Body: ChangeLanguageBody }>('/change-language', async (request: FastifyRequest<{ Body: ChangeLanguageBody }>, reply: FastifyReply) => {
    try {
      let token = request.headers['x-access-token'] as string;
      
      if (!token) {
        token = request.cookies['x-access-token'];
      }
      
      if (!token) {
        return reply.code(401).send({ error: 'Token manquant' });
      }

      const payload = app.jwt.verify(token) as { user: string };
      const email = payload.user;
      const { language } = request.body;

      const validLanguages = ['en', 'fr', 'es'];
      if (!validLanguages.includes(language)) {
        return reply.code(400).send({ error: 'Langue invalide' });
      }

      await updateLanguage(email, language);

      reply.send({ success: true, message: 'Langue modifiée avec succès' });
    } catch (err: any) {
      console.error('❌ Error in change-language:', err);
      if (err.name === 'JsonWebTokenError') {
        return reply.code(401).send({ error: 'Token invalide ou expiré' });
      }
      reply.code(500).send({ error: 'Erreur serveur interne' });
    }
  });

  const verifyCurrentPassword = async (email: string, currentPassword: string): Promise<boolean> => {
    const database = db.getDatabase();
    if (!database) {
      throw new Error('Database connection error');
    }

    return new Promise((resolve, reject) => {
      database.get(
        'SELECT password_hash FROM users WHERE email = ?',
        [email],
        async (err: any, user: { password_hash: string } | undefined) => {
          if (err) {
            reject(new Error('Database error'));
            return;
          }
          if (!user) {
            resolve(false);
            return;
          }
          try {
            const isValid = await bcrypt.compare(currentPassword, user.password_hash);
            resolve(isValid);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const updatePassword = async (email: string, newPassword: string) => {
    const database = db.getDatabase();

    if (!database) {
      console.error('❌ Database not initialized');
      throw new Error('Database connection error');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return new Promise((resolve, reject) => {
      database.run(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hashedPassword, email],
        function (this: any, err: any) {
          if (err) {
            console.error('❌ Database error:', err);
            reject(new Error('Database error'));
          } else {
            if (this.changes === 0) {
              reject(new Error('Utilisateur non trouvé'));
            } else {
              resolve(this.changes);
            }
          }
        }
      );
    });
  };

  const updateProfile = async (email: string, newEmail: string, avatar: string) => {
    const database = db.getDatabase();

    if (!database) {
      console.error('❌ Database not initialized');
      throw new Error('Database connection error');
    }

    return new Promise((resolve, reject) => {
      database.run(
        'UPDATE users SET username = ?, avatar_url = ? WHERE email = ?',
        [newEmail, avatar, email],
        function (this: any, err: any) {
          if (err) {
            console.error('❌ Database error:', err);
            reject(new Error('Database error'));
          } else {
            if (this.changes === 0) {
              reject(new Error('Utilisateur non trouvé'));
            } else {
              resolve(this.changes);
            }
          }
        }
      );
    });
  };

  const updateLanguage = async (email: string, language: string) => {
    const database = db.getDatabase();

    if (!database) {
      console.error('❌ Database not initialized');
      throw new Error('Database connection error');
    }

    return new Promise((resolve, reject) => {
      database.run(
        'UPDATE users SET language = ? WHERE email = ?',
        [language, email],
        function (this: any, err: any) {
          if (err) {
            console.error('❌ Database error:', err);
            reject(new Error('Database error'));
          } else {
            if (this.changes === 0) {
              reject(new Error('Utilisateur non trouvé'));
            } else {
              resolve(this.changes);
            }
          }
        }
      );
    });
  };
}

export default editRoutes;