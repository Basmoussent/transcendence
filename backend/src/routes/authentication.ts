import { db } from '../database';
import Fastify from 'fastify';
import { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';


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
  app.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    // Extraction des données du corps de la requête
    const { username, email, password, confirmPassword } = request.body;
    
    // Vérification de la présence de tous les champs requis
    if (!username || !email || !password || !confirmPassword) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
      return reply.status(400).send({ error: 'Passwords do not match' });
    }

    // Récupération de la connexion à la base de données
    const datab = db.getDatabase();
    // Hashage du mot de passe avec bcrypt (10 tours de hachage)
    const password_hash = await bcrypt.hash(password, 10);

    try {
      // Préparation et exécution de la requête SQL d'insertion
      const stmt = datab.prepare(
        `INSERT INTO users (username, email, password_hash)
         VALUES (?, ?, ?)`
      );
      
      stmt.run(username, email, password_hash);
      
      // Retourne un succès si l'insertion a réussi
      return reply.status(201).send({ message: 'User registered successfully' });
    } catch (err: any) {
      // Gestion des erreurs spécifiques
      if (err.message.includes('UNIQUE constraint')) {
        // Erreur si le username ou l'email existe déjà
        return reply.status(409).send({ error: 'Username or email already exists' });
      } else {
        // Erreur serveur pour les autres cas
        console.error('❌ Error inserting user:', err);
        return reply.status(500).send({ error: 'Internal server error' });
      }
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
  app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    // Extraction des données du corps de la requête
    const { username, password } = request.body;

    // Vérification de la présence des champs requis
    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password are required' });
    }

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
        async (err, user: User | undefined) => {
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

            const token = app.jwt.sign({ user: user.email , name: user.username });
            
            const origin = request.headers.origin || '';
            const host = request.headers.host || '';
            let cookieDomain;
            
            // Log pour debug
            console.log('🔍 Debug cookie domain:', { origin, host });
            
            if (origin.includes('entropy.local') || host.includes('entropy.local')) {
              cookieDomain = '.entropy.local'; // Avec le point pour partager entre sous-domaines
            } else if (origin.includes('localhost') || host.includes('localhost')) {
              const hostParts = host.split('.');
              if (hostParts.length > 1) {
                cookieDomain = `.${hostParts.slice(-1).join('.')}`; // .localhost
              } else {
                cookieDomain = ".localhost"; // Pas de domaine pour localhost simple
              }
            }
            
            console.log('Cookie domain déterminé:', cookieDomain);
            
            // Envoyer le token dans le header ET dans un cookie
            const response = reply
              .status(200)
              .header('x-access-token', token);
            
            if (cookieDomain) {
              response.header(
                'Set-Cookie',
                `x-access-token=${token}; Path=/; Domain=${cookieDomain}; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
              );
            } else {
              response.header(
                'Set-Cookie',
                `x-access-token=${token}; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
              );
            }
            
            console.log('Cookie configuré avec succès');
            
            resolve(response.send({ 
              message: "Login successful", 
              user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
              } 
            }));
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
  app.post('/logout', async (request, reply) => {
    try {
      // Déterminer le domaine du cookie selon l'environnement
      const origin = request.headers.origin || '';
      const host = request.headers.host || '';
      let cookieDomain;
      
      if (origin.includes('entropy.local') || host.includes('entropy.local')) {
        cookieDomain = '.entropy.local';
      } else if (origin.includes('localhost') || host.includes('localhost')) {
        const hostParts = host.split('.');
        if (hostParts.length > 1) {
          cookieDomain = `.${hostParts.slice(-1).join('.')}`;
        } else {
          cookieDomain = undefined;
        }
      }
      
      // Supprimer le cookie
      let cookieString = 'x-access-token=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly';
      
      if (cookieDomain) {
        cookieString += `; Domain=${cookieDomain}`;
      }
      
      const response = reply.status(200);
      response.header('Set-Cookie', cookieString);
      
      console.log('Cookie supprimé avec succès');
      
      return response.send({ message: 'Logout successful' });
    } catch (error) {
      console.error('❌ Error during logout:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  app.get('/verify', async (request, reply) => {
    let token = request.headers['x-access-token'] as string;
        
    if (!token) {
      token = request.cookies['x-access-token'];
    }
    
    if (!token) {
        return reply.status(401).send({ error: 'Token d\'authentification manquant' });
    }
  
    try {
      const decoded = app.jwt.verify(token);
      return { valid: true, payload: decoded };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid token', detail: err.message });
    }
  });
}

export default authRoutes;
