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

async function editRoutes(app: FastifyInstance) {
  app.post<{ Body: ChangePasswordBody }>('/change-password', async (request: FastifyRequest<{ Body: ChangePasswordBody }>, reply: FastifyReply) => {
    try {
      const token = request.headers['x-access-token'] as string;
      if (!token) {
        return reply.code(401).send({ error: 'Token manquant' });
      }

      const payload = fastify.jwt.verify(token) as { user: string };
      const username = payload.user;
      const { currentPassword, newPassword, confirmNewPassword } = request.body;

      // Vérification que les nouveaux mots de passe correspondent
      if (newPassword !== confirmNewPassword) {
        return reply.code(400).send({ error: 'Les nouveaux mots de passe ne correspondent pas' });
      }

      // Vérification que le nouveau mot de passe est différent de l'ancien
      if (currentPassword === newPassword) {
        return reply.code(400).send({ error: 'Le nouveau mot de passe doit être différent de l\'ancien' });
      }

      // Vérification du mot de passe actuel
      const isCurrentPasswordValid = await verifyCurrentPassword(username, currentPassword);
      if (!isCurrentPasswordValid) {
        return reply.code(401).send({ error: 'Mot de passe actuel incorrect' });
      }

      // Mise à jour du mot de passe
      await updatePassword(username, newPassword);

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
      const token = request.headers['x-access-token'] as string;
      if (!token) {
        return reply.code(401).send({ error: 'Token manquant' });
      }

      const payload = fastify.jwt.verify(token) as { user: string };
      const username = payload.user;
      const { email, avatar } = request.body;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.code(400).send({ error: 'Format d\'email invalide' });
      }

      // Validation de l'avatar (doit être un des avatars disponibles)
      const validAvatars = ['avatar.png', 'avatar1.png', 'avatar2.png', 'avatar3.png'];
      if (!validAvatars.includes(avatar)) {
        return reply.code(400).send({ error: 'Avatar invalide' });
      }

      // Mise à jour du profil
      await updateProfile(username, email, avatar);

      reply.send({ success: true, message: 'Profil modifié avec succès' });
    } catch (err: any) {
      console.error('❌ Error in edit-profile:', err);
      if (err.name === 'JsonWebTokenError') {
        return reply.code(401).send({ error: 'Token invalide ou expiré' });
      }
      reply.code(500).send({ error: 'Erreur serveur interne' });
    }
  });

  const verifyCurrentPassword = async (username: string, currentPassword: string): Promise<boolean> => {
    const database = db.getDatabase();
    if (!database) {
      throw new Error('Database connection error');
    }

    return new Promise((resolve, reject) => {
      database.get(
        'SELECT password_hash FROM users WHERE username = ?',
        [username],
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

  const updatePassword = async (username: string, newPassword: string) => {
    const database = db.getDatabase();

    if (!database) {
      console.error('❌ Database not initialized');
      throw new Error('Database connection error');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return new Promise((resolve, reject) => {
      database.run(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        [hashedPassword, username],
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

  const updateProfile = async (username: string, email: string, avatar: string) => {
    const database = db.getDatabase();

    if (!database) {
      console.error('❌ Database not initialized');
      throw new Error('Database connection error');
    }

    return new Promise((resolve, reject) => {
      database.run(
        'UPDATE users SET email = ?, avatar_url = ? WHERE username = ?',
        [email, avatar, username],
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