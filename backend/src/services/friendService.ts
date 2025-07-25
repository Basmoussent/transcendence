interface Relation {
	id: number;
	user_1: string;
	user_2: string;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
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

	async getRelations(userid: number) {

		try {
			const relations = await new Promise<Relation[] | null>((resolve, reject) => {
				this.db.all(
					'SELECT * FROM friends WHERE user_1 = ? OR user_2 = ?',
					[ userid, userid ],
					(err: any, rows: Relation[] | undefined) => {
					err ? reject(err) : resolve(rows || null); }
				);
			});
			return relations;
		}
		catch (err: any) {
			console.log(`le user ${userid} n'a pas de relations`)
		}
		return Promise.resolve(null); 
	}

	async searchRelation(id1: number, id2: number) {

		try {
			const relation = await new Promise<Relation | null>((resolve, reject) => {
				this.db.get(
					'SELECT * FROM friends WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?) ',
					[ id1, id2, id2, id1],
					(err: any, row: Relation | undefined) => {
					err ? reject(err) : resolve(row || null); }
				);
			});
			return relation;
		}
		catch (err: any) {
			console.log(`il n'y a pas de relations entre ${id1} et ${id2}`)
		}
		return Promise.resolve(null); 
	}

	async createRelation(user_1: string, user_2: string, user1_state: string, user2_state: string) {

		try {
			const existingRelation = await new Promise<Relation | null>((resolve, reject) => {
				this.db.get(
					'SELECT * FROM friends WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?) ',
					[ user_1, user_2, user_2, user_1],
					(err: any, row: Relation | undefined) => {
					err ? reject(err) : resolve(row || null); }
				);
			});
			
			if (existingRelation) {
				console.log(`Relation déjà existante entre ${user_1} et ${user_2} (ID: ${existingRelation.id})`);
				return existingRelation; // Retourner la relation existante
			}

			console.log(`Création d'une nouvelle relation entre ${user_1} et ${user_2}`);
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					'INSERT INTO friends (user_1, user_2, user1_state, user2_state) VALUES (?, ?, ?, ?)',
					[ user_1, user_2, user1_state, user2_state ],
					(err: any) => {
						err ? reject(err) : resolve(); }
				);
			});
			
			const newRelation = await new Promise<Relation | null>((resolve, reject) => {
				this.db.get(
					'SELECT * FROM friends WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?) ',
					[ user_1, user_2, user_2, user_1],
					(err: any, row: Relation | undefined) => {
					err ? reject(err) : resolve(row || null); }
				);
			});
			
			console.log(`Nouvelle relation créée entre ${user_1} et ${user_2}`);
			return newRelation;
		}
		catch (err: any) {
			console.log(`Erreur lors de la création de la relation: ${err}`);
			throw err; // Propager l'erreur pour la gestion en amont
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
	async blockRelation(blocked: string, relationId: number) {

		try {
			const angry = blocked == 'user1_state' ? 'user2_state' : 'user1_state';

			await new Promise<void>((resolve, reject) => {
				this.db.run(
					`UPDATE friends SET ${angry} = 'angry', ${blocked} = 'blocked' WHERE id = ?`,
					[ relationId ],
					(err: any) => {	err ? reject(err) : resolve();})
			});
		}
		catch (err: any) {
			console.log(`on deny la relation; friends(${relationId}) `)
		}
	}

	async blockUser(angry: number, blocked: number) {

		try {
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					`INSERT INTO friends (user_1, user_2, user1_state, user2_state) VALUES (?, ?, ?, ?)`,
					[ angry, blocked, 'angry', 'blocked' ],
					(err: any) => {
					err ? reject(err) : resolve();
			})});
		}
		catch (err: any) {
			console.log(`pblm creer la relation en bloquant ${blocked}`)
		}
	}

}