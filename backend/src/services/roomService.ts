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

			fieldsToUpdate.push("game_type = ?");
			values.push(data.gameType);

			const users = Array.from((data.users as any).values());
   2 
			for (let i = 0; i < 4; i++) {
				fieldsToUpdate.push(`player${i + 1} = ?`);
				users[i] ? values.push((users[i] as any).username) : values.push(null);
			}

			fieldsToUpdate.push("users_needed = ?");
			values.push(data.maxPlayers);

			fieldsToUpdate.push("ai = ?");
			values.push(data.ai);

			await new Promise<void>((resolve, reject) => {
				this.db.run(
					`UPDATE games SET ${fieldsToUpdate.join(", ")} WHERE uuid = ?`,
					[ data.id ],
					(err: any) => {	err ? reject(err) : resolve(); });
			});
		}
		catch (err: any) {
			console.error("Erreur dans updateGame:", err);
		}
	}


}
