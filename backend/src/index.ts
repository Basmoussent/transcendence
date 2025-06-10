import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import Database from 'better-sqlite3';
import Vault from 'hashi-vault-js';

const VAULT_ADDR = process.env.VAULT_ADDR || 'http://vault:8200';
const VAULT_TOKEN = process.env.VAULT_TOKEN || 'root';

const vault = new Vault({
  apiVersion: 'v1',
  endpoint: VAULT_ADDR,
  token: VAULT_TOKEN,
});

// Example function to read a secret from Vault
async function getSecret(path: string) {
  try {
    const response = await vault.readKVSecret(VAULT_TOKEN, path);
    return response.data;
  } catch (error) {
    console.error('Error reading from Vault:', error);
    throw error;
  }
}

const db = new Database('database.sqlite');

const fastify = Fastify({
  logger: true
});

// Register plugins
fastify.register(cors, {
  origin: true
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key'
});

fastify.register(websocket);

// Health check route
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 8000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 