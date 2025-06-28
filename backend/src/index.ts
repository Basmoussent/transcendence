// type: ignore
import * as dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart'
import { db } from './database';
import authRoutes from "./routes/authentication"
import editRoutes from './routes/reset-pwd';
import userRoutes from './routes/user';
import { getSecretFromVault } from './utils/vault';



const fastify = Fastify({ logger: { level: 'debug' } });

async function setup() {
  // Initialize database first
  await db.initialize();

  // Register CORS
  await fastify.register(cors, {
    origin: ['https://fr.localhost:5173', 'https://en.localhost:5173', "https://es.localhost:5173"],
    credentials: true,
    preflightContinue: false,
    exposedHeaders: ['x-access-token']
  });

  await fastify.register(cookie);

  await fastify.register(multipart, {
      fieldNameSize: 30,
      fileSize: 50000000, // 50MB
      files: 1
  });

  // on enregistre les routes definis, qui seront chacune sur /prefix/nom_de_la_route
  await fastify.register(authRoutes, {prefix: "/auth"});
  await fastify.register(editRoutes, {prefix: "/edit"});
  await fastify.register(userRoutes);
  
  // Register WebSocket
  await fastify.register(websocket);

  // Register JWT
  const jwtSecret =  await getSecretFromVault("JWT", "JWT_KEY") || "secret";
  console.log("JWT = ",  jwtSecret);
  await fastify.register(require('@fastify/jwt'), {
  secret: jwtSecret
  })
  
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

export default fastify;