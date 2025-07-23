import bcrypt from 'bcrypt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { generateBase32Key } from './routes/utils';

import { db } from './database';


export async function insert_tmp_user(app: FastifyInstance) {

	const password_hash = await bcrypt.hash('ok', 10);
	const secret_key = generateBase32Key();

	try {

		// Préparation et exécution de la requête SQL d'insertion
		const stmt = db.getDatabase().prepare(
			`INSERT INTO users (username, email, password_hash, secret_key)
				VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING`
		);

		stmt.run('talan', 'talan@test.com', password_hash, secret_key);

		const stmt2 = db.getDatabase().prepare(
			`INSERT INTO statistics (username)
			VALUES (?) ON CONFLICT(username) DO NOTHING`
		);

		stmt2.run('talan');

		

	} catch (err: any) {
		console.error('❌ Error inserting user:', err);
	}

	try {

		// Préparation et exécution de la requête SQL d'insertion
		const stmt = db.getDatabase().prepare(
			`INSERT INTO users (username, email, password_hash, secret_key)
				VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING`
		);

		stmt.run('basem', 'basem@test.com', password_hash, secret_key);

		const stmt2 = db.getDatabase().prepare(
			`INSERT INTO statistics (username)
			VALUES (?) ON CONFLICT(username) DO NOTHING`
		);

		stmt2.run('basem');

		

	} catch (err: any) {
		console.error('❌ Error inserting user:', err);
	}

	try {

		// Préparation et exécution de la requête SQL d'insertion
		const stmt = db.getDatabase().prepare(
			`INSERT INTO users (username, email, password_hash, secret_key)
				VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING`
		);

		stmt.run('ines', 'ines@test.com', password_hash, secret_key);

		const stmt2 = db.getDatabase().prepare(
			`INSERT INTO statistics (username)
			VALUES (?) ON CONFLICT(username) DO NOTHING`
		);

		stmt2.run('ines');

		

	} catch (err: any) {
		console.error('❌ Error inserting user:', err);
	}

	try {

		// Préparation et exécution de la requête SQL d'insertion
		const stmt = db.getDatabase().prepare(
			`INSERT INTO users (username, email, password_hash, secret_key)
				VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING`
		);

		stmt.run('polo', 'polo@test.com', password_hash, secret_key);

		const stmt2 = db.getDatabase().prepare(
			`INSERT INTO statistics (username)
			VALUES (?) ON CONFLICT(username) DO NOTHING`
		);

		stmt2.run('polo');

		

	} catch (err: any) {
		console.error('❌ Error inserting user:', err);
	}


	try {

		// Préparation et exécution de la requête SQL d'insertion
		const stmt = db.getDatabase().prepare(
			`INSERT INTO users (username, email, password_hash, secret_key)
				VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING`
		);

		stmt.run('polo2', 'polo2@test.com', password_hash, secret_key);

		const stmt2 = db.getDatabase().prepare(
			`INSERT INTO statistics (username)
			VALUES (?) ON CONFLICT(username) DO NOTHING`
		);

		stmt2.run('polo2');

		

	} catch (err: any) {
		console.error('❌ Error inserting user:', err);
	}

}