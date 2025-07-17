import { redis } from '../index';

interface UserData {
	id: number;
	username: string;
	email: string;
	avatar_url?: string;
	language: string;
}

export class UserService {

	private db: any;
  
	constructor(private database: any) {
		this.db = database;
	}

	async findByUsername(username: string) {

		console.log(`Recherche de l'utilisateur : ${username}`);
		try {
			const user = await new Promise<UserData | null>((resolve, reject) => {
				this.db.get(
					'SELECT * FROM users WHERE username = ?',
					[ username ],
					(err: any, row: UserData | undefined) => {
					err ? reject(err) : resolve(row || null); }
				);
			});
			return user;
		}
		catch (err: any) {
			console.log(`le user ${username} n'existe pas`)
		}
		return Promise.resolve(null); 
	}

	async findById(id: number) {

		console.log(`Recherche de l'utilisateur par ID : ${id}`);
		try {
			const user = await new Promise<UserData | null>((resolve, reject) => {
				this.db.get(
					'SELECT * FROM users WHERE id = ?',
					[ id ],
					(err: any, row: UserData | undefined) => {
					err ? reject(err) : resolve(row || null); }
				);
			});
			return user;
		}
		catch (err: any) {
			console.log(`le user ${id} n'existe pas`)
		}
		return Promise.resolve(null);
	}

	async isOnline(id: number) {
		const user = await this.findById(id);
		if (user) {
			return redis.get(`alive:${id}`);
		}
		return false;
	}
}
