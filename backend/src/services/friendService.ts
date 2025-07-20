interface Relation {
	id: number;
	user_1: string;
	user_2: string;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked';
}

export class FriendService {

	private db: any;
  
	constructor(private database: any) {
		this.db = database;
	}

	async getFriends(username: string) {
		
		try {
			const friends = await new Promise<Relation[]| null>((resolve, reject) => {
				this.db.all(
					'SELECT * FROM friends WHERE (user_1 = ? OR user_2 = ?) AND user1_state = ? AND user2_state = ?',
					[ username, username, 'normal', 'normal'],
					(err: any, rows: Relation[] | undefined) => {
					err ? reject(err) : resolve(rows || null); }
				)
			})
			return friends;
		}
		catch (err: any) {
			console.log(`le user ${username} n'a pas d'amis`)
		}
		return Promise.resolve(null); 
	}

	async getRelations(username: string) {

		try {
			const relations = await new Promise<Relation[] | null>((resolve, reject) => {
				this.db.all(
					'SELECT * FROM friends WHERE user_1 = ? OR user_2 = ?',
					[ username, username ],
					(err: any, rows: Relation[] | undefined) => {
					err ? reject(err) : resolve(rows || null); }
				);
			});
			return relations;
		}
		catch (err: any) {
			console.log(`le user ${username} n'a pas de relations`)
		}
		return Promise.resolve(null); 
	}

	async createRelation(user_1: string, user_2: string, user_1_state: string, user_2_state: string) {

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

	async acceptRelation(relationId: number) {
		try {
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					'UPDATE friends SET user1_state = ?, user2_state = ? WHERE id = ?',
					[ 'normal', 'normal', relationId ],
					(err: any) => {
					err ? reject(err) : resolve();
			})});
		}
		catch (err: any) {
			console.log(`fail accepter l'amitié; friends(${relationId}) `)
		}

	}

	async denyRelation(relationId: number) {

		try {
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					'DELETE FROM friends WHERE id = ?',
					[ relationId ],
					(err: any) => {
					err ? reject(err) : resolve();
			})});
		}
		catch (err: any) {
			console.log(`on deny la relation; friends(${relationId}) `)
		}
	}

	// blocked == 'user1_state' | 'user2_state'
	async blockUser(blocked: string, relationId: number) {

		try {
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					`UPDATE friends SET ${blocked} = 'blocked' WHERE id = ?`,
					[ relationId ],
					(err: any) => {	err ? reject(err) : resolve();})
			});
		}
		catch (err: any) {
			console.log(`on deny la relation; friends(${relationId}) `)
		}
	}

}
