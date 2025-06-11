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
  app.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    const { username, email, password, confirmPassword } = request.body;
    
    if (!username || !email || !password || !confirmPassword) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return reply.status(400).send({ error: 'Passwords do not match' });
    }

    const datab = db.getDatabase();
    const password_hash = await bcrypt.hash(password, 10);

    try {
      const stmt = datab.prepare(
        `INSERT INTO users (username, email, password_hash)
         VALUES (?, ?, ?)`
      );
      
      stmt.run(username, email, password_hash);
      
      return reply.status(201).send({ message: 'User registered successfully' });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint')) {
        return reply.status(409).send({ error: 'Username or email already exists' });
      } else {
        console.error('❌ Error inserting user:', err);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });
  
  app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { username, password } = request.body;

    // Validate required fields
    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password are required' });
    }

    const database = db.getDatabase();

    try {
      const stmt = database.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get(username) as unknown as User | undefined;

      console.log('🔍 Debug - Raw user object:', user);
      console.log('🔍 Debug - User type:', typeof user);
      console.log('🔍 Debug - User keys:', user ? Object.keys(user) : 'user is null/undefined');
      console.log('🔍 Debug - password_hash value:', user ? (user as any).password_hash : 'user is null');

      if (!user) {
        return reply.status(401).send({ error: 'Invalid username or password' });
      }

      // Validate that password_hash exists
      if (!user.password_hash) {
        console.error('❌ User found but password_hash is missing');
        console.error('❌ Full user object:', JSON.stringify(user, null, 2));
        return reply.status(500).send({ error: 'Internal server error' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return reply.status(401).send({ error: 'Invalid username or password' });
      }

      // const token = app.jwt.sign({ id: user.id, username: user.username });
      return reply.send("tout est bon bg");
    } catch (error) {
      console.error('❌ Error during login:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}

export default authRoutes;
