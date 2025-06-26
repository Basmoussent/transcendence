import { db } from '../database';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import fastify from '../index';

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface EditProfileBody {
  email: string;
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

      const payload = fastify.jwt.verify(token) as { user: string };
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

  app.post<{ Body: EditProfileBody }>('/profile', async (request: FastifyRequest<{ Body: EditProfileBody }>, reply: FastifyReply) => {
    try {
      // Récupérer le token depuis les headers ou les cookies
      let token = request.headers['x-access-token'] as string;
      
      if (!token) {
        token = request.cookies['x-access-token'];
      }
      
      if (!token) {
        return reply.code(401).send({ error: 'Token manquant' });
      }

      const payload = fastify.jwt.verify(token) as { user: string };
      const email = payload.user;
      const { email: newEmail, avatar } = request.body;

      // TODO: add a username validator
      const validAvatars = ['avatar.png', 'avatar1.png', 'avatar2.png', 'avatar3.png'];
      if (!validAvatars.includes(avatar)) {
        return reply.code(400).send({ error: 'Avatar invalide' });
      }

      await updateProfile(email, newEmail, avatar);

      reply.send({ success: true, message: 'Profil modifié avec succès' });
    } catch (err: any) {
      console.error('❌ Error in edit-profile:', err);
      if (err.name === 'JsonWebTokenError') {
        return reply.code(401).send({ error: 'Token invalide ou expiré' });
      }
      reply.code(500).send({ error: 'Erreur serveur interne' });
    }
  });

  app.post<{ Body: ChangeLanguageBody }>('/change-language', async (request: FastifyRequest<{ Body: ChangeLanguageBody }>, reply: FastifyReply) => {
    try {
      // Récupérer le token depuis les headers ou les cookies
      let token = request.headers['x-access-token'] as string;
      
      if (!token) {
        token = request.cookies['x-access-token'];
      }
      
      if (!token) {
        return reply.code(401).send({ error: 'Token manquant' });
      }

      const payload = fastify.jwt.verify(token) as { user: string };
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