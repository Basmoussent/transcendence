interface User {
	username: string;
	userid: number;
	isReady: boolean;
	avatar?: string;
}

interface RoomData {
	id: string;
	name: string;
	gameType: string;
	maxPlayers: number;
	users: User[];
	host: string;
	ai: number;
}

export class RoomService {

	private db: any;
  
	constructor(private database: any) {
		this.db = database;
	}

	// update l'interface pour prendre la meme que dans ws_room avec une map au lieu d'un array
	async updateGame(data: RoomData) {
		try {
			const fieldsToUpdate: string[] = [];
			const values: any[] = [];

			fieldsToUpdate.push("game_type = ?");
			values.push(data.gameType);

			const users = Array.from((data.users as any).values());
			
			for (let i = 0; i < 4; i++) {

				if (users[i]) {
					fieldsToUpdate.push(`player${i + 1} = ?`);
					values.push((users[i] as any).id);
				}
				else {
					fieldsToUpdate.push(`player${i + 1} = ?`);
					values.push(null);
				}
			}

			values.push(data.maxPlayers);
			values.push(data.ai);


			console.log(`la requete sql ::::: UPDATE games SET ${fieldsToUpdate.join(", ")}`)
			console.log(`les values dans l'ordre ${values}`)

			const sql = `UPDATE games SET ${fieldsToUpdate.join(", ")} WHERE uuid = ?`;
			values.push(data.id);

			await new Promise<void>((resolve, reject) => {
				this.db.run(sql, values, (err: any) => {
					err ? reject(err) : resolve();
				});
			});
		}
		catch (err: any) {
			console.error("Erreur dans updateGame:", err);
		}
	}

	async existingRoom(uuid: string) {
		try {
			const sql = `SELECT * FROM games WHERE uuid = ?`;
			const room = await new Promise<any>((resolve, reject) => {
				this.db.get(sql, uuid, (err: any, room: any) => {
					err ? reject(err) : resolve(room);
				});
			});
			if (room) {
				return room;
			}
			else {
				return null;
			}
		}
		catch (err: any) {
			console.error("Erreur dans existingRoom:", err);
		}
	}
}

