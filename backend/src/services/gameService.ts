interface Game {
	id: number;
	uuid: number;
	game_type: string;
	player1: string;
	player2?: string;
	player3?: string;
	player4?: string;
	users_needed: number;
	ai: number;
	start_time?: number;
	end_time?: number;
	winner?: number;
}


export class GameService {

	private db: any;
  
	constructor(private database: any) {
		this.db = database;
	}

	async getGame(uuid: string) {

		try {
			const game = await new Promise<Game | null>((resolve, reject) => {
				this.db.get(
					'SELECT * FROM games WHERE uuid = ?',
					[ uuid ],
					(err: any, rows: Game | undefined) => {
					err ? reject(err) : resolve(rows || null); }
				);
			});
			return game;
		}
		catch (err: any) {
			console.log(`${uuid} fail getGame dans le back`)
		}
		return Promise.resolve(null); 
	}

	async deleteGame(uuid: string) {

		try {
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					'DELETE FROM games WHERE uuid = ?',
					[ uuid ],
					(err: any) => {
						err ? reject(err) : resolve (); }
				);
			});
		}
		catch (err: any) {
			console.log(`${uuid} game supprimé`)
		}
		return Promise.resolve(null); 
	}


}
