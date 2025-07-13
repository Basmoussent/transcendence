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
import gameRoutes from './routes/game';
import editRoutes from './routes/reset-pwd';
import userRoutes from './routes/user';
import friendRoutes from './routes/friend';
import webSocketRoutes from './routes/web-socket';
import { getSecretFromVault } from './utils/vault';
import barRoutes from './routes/testrouter';

const fastify = Fastify({ logger: { level: 'debug' } });

async function setup() {

	console.log('🚀 Starting setup...');

	// Initialize database first
	console.log('📦 Initializing database...');
	await db.initialize();
	console.log('✅ Database initialized');

	// Register CORS
	console.log('🌐 Registering CORS...');
	await fastify.register(cors, {
		origin: [
		'https://localhost:2443',
		'https://fr.localhost:5173',
		'https://en.localhost:5173',
		'https://es.localhost:5173',
		'https://fr.entropy.local',
		'https://en.entropy.local',
		'https://es.entropy.local'
		],
		credentials: true,
		preflightContinue: false,
		exposedHeaders: ['x-access-token'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
		// louche qu'on puisse pas faire de get depuis le port 2443 sans methods et allowedHeaders
	});
	console.log('✅ CORS registered');

	console.log('🍪 Registering cookie plugin...');
	await fastify.register(cookie);
	console.log('✅ Cookie plugin registered');

	console.log('📁 Registering multipart plugin...');
	await fastify.register(multipart, {
		fieldNameSize: 30,
		fileSize: 50000000, // 50MB
		files: 1
	});
	console.log('✅ Multipart plugin registered');

	// on enregistre les routes definis, qui seront chacune sur /prefix/nom_de_la_route
	console.log('🛣️ Registering routes...');
	await fastify.register(authRoutes, { prefix: "/auth" });
	console.log('✅ Auth routes registered');
	await fastify.register(editRoutes, { prefix: "/edit" });
	console.log('✅ Edit routes registered');
	await fastify.register(userRoutes);
	console.log('✅ User routes registered');
	await fastify.register(gameRoutes, { prefix: "/games" });
	console.log('✅ Games routes registered');
	await fastify.register(friendRoutes, { prefix: "/friend" });
	console.log('✅ Friend routes registered');
	

	console.log('📡 Registering WebSocket routes...');
	await fastify.register(require('@fastify/websocket'));
	await fastify.register(webSocketRoutes);
	console.log('✅ WebSocket routes registered');

	// Register JWT
	console.log('🔑 Getting JWT secret from Vault...');
	const jwtSecret = await getSecretFromVault("JWT", "JWT_KEY") || "secret";
	console.log("JWT = ", jwtSecret);
	console.log('🔑 Registering JWT plugin...');
	await fastify.register(require('@fastify/jwt'), {
		secret: jwtSecret
	})
	console.log('✅ JWT plugin registered');

	console.log('🏠 Setting up basic routes...');
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
		}
		catch (error) {
			return { status: 'error', error: error };}
	});

	console.log('✅ Basic routes set up');

	console.log('🌍 Starting server...');
	await fastify.listen({ port: 8000, host: '0.0.0.0' });
	console.log('🚀 Server running on http://localhost:8000');

	console.log("etat de mon websocket", fastify.websocketServer);

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