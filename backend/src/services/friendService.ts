interface Relation {
	user_1: number;
	user_2: number;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked';
}

export class FriendService {

	private db: any;
  
	constructor(private database: any) {
		this.db = database;
	}

	async getRelations(userId: number) {

		try {
			const relations = await new Promise<Relation[] | null>((resolve, reject) => {
				this.db.all(
					'SELECT * FROM friends WHERE user_1 = ? || user_2 = ?',
					[ userId, userId ],
					(err: any, row: Relation[] | undefined) => {
					err ? reject(err) : resolve(row || null); }
				);
			});
			return relations;
		}
		catch (err: any) {
			console.log(`le user ${userId} n'a pas d'amis`)
		}
		return Promise.resolve(null); 
	}

	async createRelation(user_1: number, user_2: number, user_1_state: string, user_2_state: string) {

		try {
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					'INSERT INTO friends (user_1, user_2, user1_state, user2_state) VALUES (?, ?, ?, ?)',
					[ user_1, user_2, user_1_state, user_2_state ],
					(err: any) => {
						err ? reject(err) : resolve(); }
				);
			});
			console.log(`nouvelle relation entre ${user_1} et ${user_2}`)
		}
		catch (err: any) {
			console.log(`fail de creer une relation `)
		}
	}
}
