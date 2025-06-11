import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';
import fs from 'fs';
import path from 'path';

export class DatabaseService {
  private db: sqlite3.Database | null = null;

  constructor(private dbPath: string = path.resolve('./data/database.sqlite')) {}

  async initialize(): Promise<void> {
    try {
      // Crée le dossier si nécessaire
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Ouvre la base de données
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err);
          throw err;
        }
        console.log('📦 Connected to SQLite database');
      });

      await this.initializeDatabase();
    } catch (error) {
      console.error('❌ Error initializing database service:', error);
      throw error;
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const sqlPath = ('/app/sql/init.sql');
      const initSql = readFileSync(sqlPath, 'utf8');

      return new Promise((resolve, reject) => {
        this.db!.exec(initSql, (err) => {
          if (err) {
            console.error('❌ Error executing init SQL:', err);
            reject(err);
          } else {
            console.log('✅ Database initialized successfully');
            resolve();
          }
        });
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
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('📦 Database connection closed');
        }
      });
    }
  }
}

export const db = new DatabaseService();