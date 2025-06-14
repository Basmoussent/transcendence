// type: ignore
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { db } from './database';
import authRoutes from "./routes/authentication"


const fastify = Fastify({
  logger: true
});

async function setup() {
  // Initialize database first
  await db.initialize();

  // Register CORS
  await fastify.register(cors, { 
    origin: '*'
  });
  // on enregistre les routes definis, qui seront chacune sur /auth/nom_de_la_route
  await fastify.register(authRoutes, {prefix: "/auth"});
  
  // Register WebSocket
  await fastify.register(websocket);

  // Register JWT
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here';
  await fastify.register(jwt, {
    secret: jwtSecret,
  });
  
  fastify.get('/', async () => {
    return { message: 'API is up', database: 'connected' };
  });

  fastify.get('/ping', async () => {
    return { message: 'pong' };
  });

  // Database health check
  fastify.get('/health/db', async () => {
    try {
      const datab = db.getDatabase();
      const stmt = datab.prepare('SELECT COUNT(*) as count FROM users');
      const result = stmt.get();
      return { status: 'ok', users_count: result };
    } catch (error) {
      return { status: 'error', error: error };
    }
  });

  await fastify.listen({ port: 8000, host: '0.0.0.0' });
  console.log('🚀 Server running on http://localhost:8000');
}

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

setup().catch(console.error);