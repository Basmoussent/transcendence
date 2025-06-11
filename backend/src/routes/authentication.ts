import { db } from '../database';
import Fastify from 'fastify';
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';

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

async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    const { username, email, password, confirmPassword } = request.body;
    // On extrait les valeurs du body de la requete
    // on faiss quelque check annodins
    if (!username || !email || !password || !confirmPassword) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return reply.status(400).send({ error: 'Passwords do not match' });
    }
    // on recupere la db pour pouvoir y acceder
    const datab = db.getDatabase();
    // Pour des raisons de securite les valeurs d'identification (MDP, 2FA, etc...)
    // sont toujours stocke de maniere (hasher)
    const password_hash = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      const stmt = datab.prepare(
        `INSERT INTO users (username, email, password_hash)
         VALUES (?, ?, ?)`,
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint')) {
              reply.status(409).send({ error: 'Username or email already exists' });
              return resolve(null);
            } else {
              console.error('❌ Error inserting user:', err);
              reply.status(500).send({ error: 'Internal server error' });
              return resolve(null);
            }
          }

          reply.status(201).send({ message: 'User registered successfully' });
          return resolve(null);
        }
      );

      stmt.run(username, email, password_hash);
    });
  });
  
  app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { username, password } = request.body;

    const database = db.getDatabase();

    // on vas recupere nos donne via la abse de donnes avec un query
    // dans ce cas on vas recuperer tout les attributs de la BDD users
    // la ou user.username et egale a celui de la requete
    // la fonction nous renvoie un dictionnaire tel que
    // {user.id, user.username, user.password_hash, ...}
    const user = await new Promise<any | undefined>((resolve, reject) => {
      database.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }
    // on verifie si le mdp que le hash du mot de passe que l'utilisateur a envoye
    // corresponds a celui stocke dans la base de donnees;
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }

    // const token = app.jwt.sign({ id: user.id, username: user.username });
    // Si tout c'est bien passe on renvoie en generale un token
    // d'authentification unique a notre utilisateur pour le reconnaitre
    return reply.send("tout est bon bg");
  });
}

export default authRoutes;
