import { db } from '../database';
import Fastify from 'fastify';
import { FastifyInstance } from 'fastify';
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
            // Comparaison du mot de passe fourni avec le hash stocké
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            // Si le mot de passe ne correspond pas
            if (!passwordMatch) {
              resolve(reply.status(401).send({ error: 'Invalid username or password' }));
              return;
            }

            // Succès de la connexion
            resolve(reply.status(200).send({ 
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
}

export default authRoutes;
