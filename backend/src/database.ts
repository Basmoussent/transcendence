import { readFileSync } from 'fs';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { getSecretFromVault } from './utils/vault';

export class DatabaseService {
  private db: sqlite3.Database | null = null;
  private password: string | null = null;

  constructor(
    private dbPath: string = path.resolve('./data/database.sqlite')
  ) {}

  async initialize(): Promise<void> {
    try {
      // Créer le dossier si nécessaire
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const isNewDb = !fs.existsSync(this.dbPath);

      // Ouvrir la DB sans chiffrement pour le moment
      this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err.message);
          throw err;
        }

        console.log('📦 Connected to SQLite database (unencrypted)');
        this.initializeDatabase().catch(console.error);
      });
    } catch (error) {
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
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  public close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) console.error('❌ Error closing database:', err.message);
        else console.log('📦 Database connection closed');
      });
    }
  }
}

export const db = new DatabaseService();