import { readFileSync } from 'fs';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

export class DatabaseService {

	private db: sqlite3.Database | null = null;
	private dbPath: string;

	//TALAN
	constructor() {
		this.dbPath = path.resolve('./data/database.sqlite')
	}

	async initialize(): Promise<void> {
		try {
			const dir = path.dirname(this.dbPath);

			if (!fs.existsSync(dir))
				fs.mkdirSync(dir, { recursive: true });

			const isNewDb = !fs.existsSync(this.dbPath);

			// TODO:add database encryption using apasshohrase stored in vault
			this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {

				if (err) {
					console.error('❌ Error opening database:', err.message);
					throw err;
				}

				console.log('📦 Connected to SQLite database (unencrypted)');

				// Activer les foreign keys pour ON UPDATE CASCADE

				this.initializeDatabase().catch(console.error);
			});
		}
		catch (error) {
			console.error('❌ Error initializing database service:', error);
			throw error;
		}
	}

	private async initializeDatabase(): Promise<void> {
		try {
			const sqlPath = '/app/sql/init.sql';
			const initSql = readFileSync(sqlPath, 'utf8');

			this.db!.exec(initSql, (err) => {
				if (err) {
					console.error('❌ Error executing init SQL:', err.message);
					throw err;
				}
				console.log('✅ Database initialized and encrypted successfully');
			});
		} catch (error) {
			console.error('❌ Error reading init SQL file:', error);
			throw error;
		}
	}

	public getDatabase(): sqlite3.Database {

		if (!this.db)
			throw new Error('Database not initialized');
		return this.db;
	}

	public close(): void {
		if (this.db) {
			this.db.close((err: any) => { //TALAN
				if (err) console.error('❌ Error closing database:', err.message);
				else console.log('📦 Database connection closed');
			});
		}
	}
}

export const db = new DatabaseService();