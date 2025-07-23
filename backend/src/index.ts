// type: ignore
import * as dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import multipart from '@fastify/multipart'
import { db } from './database';
import { UserService } from './services/userService';
import { FriendService } from './services/friendService';
import { GameService } from './services/gameService';
import { RoomService } from './services/roomService';
import { ChatService } from './services/chatService';
import  { insert_tmp_user } from './insert_tmp_user';
import authRoutes from "./routes/authentication"
import gameRoutes from './routes/game';
import editRoutes from './routes/reset-pwd';
import userRoutes from './routes/user';
import friendRoutes from './routes/friend';
import webSocketRoutes from './routes/web-socket';
import { getSecretFromVault } from './utils/vault';
import { createClient } from 'redis';


const fastify = Fastify({ logger: { level: 'debug' } });

declare module 'fastify' {
	interface FastifyInstance {
		userService: UserService;
		friendService: FriendService;
		gameService: GameService;
		roomService: RoomService;
		chatService: ChatService;
		jwt: any;
		jwt2fa: {
			sign: (payload: any) => string;
			verify: (token: string) => any;
		};
	}
}

// Initialisation du client Redis
export const redis = createClient({
	url: process.env.REDIS_URL || 'redis://redis:6378'
});
redis.on('error', (err: any) => console.error('Redis Client Error', err));
redis.connect();


async function setup() {

	console.log('🚀 Starting setup...');

	console.log('📦 Initializing database...');
	await db.initialize();
	console.log('✅ Database initialized');

	console.log('🛠️  Decorating services...');
	fastify.decorate('userService', new UserService(db.getDatabase()));
	fastify.decorate('friendService', new FriendService(db.getDatabase()));
	fastify.decorate('gameService', new GameService(db.getDatabase()));
	fastify.decorate('roomService', new RoomService(db.getDatabase()));
	fastify.decorate('chatService', new ChatService(db.getDatabase()));
	

	console.log('✅ Services decorated');

	console.log('🔑 Getting JWT secret from Vault...');
	const jwtSecret = await getSecretFromVault("JWT", "JWT_KEY") || "secret";
	const jwtSecret2 = await getSecretFromVault("KEY", "KEY_SECRET") || "key_secret";
	console.log(`JWT = ${jwtSecret} -  KEY_SECRET = ${jwtSecret2} `)
	console.log('🔑 Registering JWT plugins...');
	
	await fastify.register(jwt, {
		secret: jwtSecret,
		decoratorName: 'jwt'
	});

	// Create a separate JWT instance for 2FA
	const jwt2faInstance = {
		sign: (payload: any) => {
			// Use the same JWT library but with different secret
			const jwt = require('jsonwebtoken');
			return jwt.sign(payload, jwtSecret2);
		},
		verify: (token: string) => {
			const jwt = require('jsonwebtoken');
			return jwt.verify(token, jwtSecret2);
		}
	};
	
	fastify.decorate('jwt2fa', jwt2faInstance);

	// Register CORS
	console.log('🌐 Registering CORS...');
	await fastify.register(cors, {
		origin: [
		'https://localhost:2443',
		'https://fr.entropy.local',
		'https://en.entropy.local',
		'https://es.entropy.local'
		],
		credentials: true,
		preflightContinue: false,
		exposedHeaders: ['x-access-token'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
	});
	console.log('✅ CORS registered');


	console.log('📁 Registering multipart plugin...');
	await fastify.register(multipart, {
		fieldNameSize: 30,
		fileSize: 50000000, // 50MB
		files: 1
	});
	console.log('✅ Multipart plugin registered');

	console.log('🛣️ Registering routes...');
	await fastify.register(authRoutes, { prefix: "/auth" });
	await fastify.register(editRoutes, { prefix: "/edit" });
	await fastify.register(userRoutes);
	await fastify.register(gameRoutes, { prefix: "/games" });
	await fastify.register(friendRoutes, { prefix: "/friend" });

	console.log('📡 Registering WebSocket routes...');
	await fastify.register(require('@fastify/websocket'));//TALAN
	await fastify.register(webSocketRoutes);
	console.log('✅ WebSocket routes registered');
	await fastify.register(require('@fastify/cookie'));

	console.log('🏠 Setting up basic routes...');
	fastify.get('/', async () => {
		return { message: 'API is up', database: 'connected' };
	});

	fastify.get('/ping', async () => {
		return { message: 'pong' };
	});

	await insert_tmp_user(fastify);

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