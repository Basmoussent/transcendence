interface User {
	username: string;
	isReady: boolean;
	avatar?: string;
}

interface RoomData {
	id: string;
	name: string;
	gameType: 'pong' | 'block';
	maxPlayers: number;
	users: User[];
	host: string;
	isGameStarted: boolean;
	ai: number;
}

export class RoomService {

	private db: any;
  
	constructor(private database: any) {
		this.db = database;
	}

	async updateGame(data: RoomData) {
		try {
			const fieldsToUpdate: string[] = [];
			const values: any[] = [];

			// Game type
			fieldsToUpdate.push("game_type = ?");
			values.push(data.gameType);

			// Players
			if (data.users[0]) {
				fieldsToUpdate.push("player1 = ?");
				values.push(data.users[0].username);
			}
			if (data.users[1]) {
				fieldsToUpdate.push("player2 = ?");
				values.push(data.users[1].username);
			}
			if (data.users[2]) {
				fieldsToUpdate.push("player3 = ?");
				values.push(data.users[2].username);
			}
			if (data.users[3]) {
				fieldsToUpdate.push("player4 = ?");
				values.push(data.users[3].username);
			}

			// Users needed (from maxPlayers)
			fieldsToUpdate.push("users_needed = ?");
			values.push(data.maxPlayers);

			// AI setting
			fieldsToUpdate.push("ai = ?");
			values.push(data.ai);

			// Finalize SQL
			const sql = `UPDATE games SET ${fieldsToUpdate.join(", ")} WHERE uuid = ?`;
			values.push(data.id);  // UUID is used in WHERE clause

			await new Promise<void>((resolve, reject) => {
				this.db.run(sql, values, (err: any) => {
					err ? reject(err) : resolve();
				});
			});

			console.log(`j'ai bien update la game dans la db`)

		} catch (err: any) {
			console.error("Erreur dans updateGame:", err);
		}
	}


}
