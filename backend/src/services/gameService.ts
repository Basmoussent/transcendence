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
			console.log(`${uuid} game supprimé`)
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

	async moveToHistory(uuid: string, winner: string) {
		try {
			// Récupérer la partie depuis la table games
			const game = await this.getGame(uuid);
			if (!game) {
				console.log(`Partie ${uuid} non trouvée pour déplacement vers history`);
				return false;
			}

			const winnerId = winner;

			// Insérer dans la table history
			await new Promise<void>((resolve, reject) => {
				this.db.run(
					`INSERT INTO history (uuid, game_type, player1, player2, player3, player4, users_needed, ai, start_time, end_time, winner) 
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						game.uuid,
						game.game_type,
						game.player1,
						game.player2,
						game.player3,
						game.player4,
						game.users_needed,
						game.ai,
						game.start_time,
						Date.now().toString(),
						winnerId
					],
					(err: any) => {
						err ? reject(err) : resolve();
					}
				);
			});

			// Supprimer de la table games
			await this.deleteGame(uuid);
			console.log(`Partie ${uuid} déplacée vers history avec winner ID: ${winnerId}`);
			return true;
		}
		catch (err: any) {
			console.error(`Erreur lors du déplacement de la partie ${uuid} vers history:`, err);
			return false;
		}
	}

	async logTournamentGame(uuid: string, player1: string, player2: string, winner: string, start_time: string) {

		try {
			let winnerId = winner;
			try {
				if (!isNaN(Number(winner))) {
					winnerId = winner;
				} else {
					winnerId = winner;
				}
			} catch (error) {
				console.error(`Erreur lors de la conversion du winner ${winner} en ID:`, error);
				winnerId = winner;
			}

			await new Promise<void>((resolve, reject) => {
				this.db.run(
					`INSERT INTO history (uuid, game_type, player1, player2, start_time, end_time, winner) 
					 VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[ uuid, 'pong', player1, player2, start_time, Date.now().toString(), winnerId],
					(err: any) => {
						err ? reject(err) : resolve();
					}
				);
			});

			await this.deleteGame(uuid);
			console.log(`TOURNOI      Partie ${uuid} déplacée vers history avec winner ID: ${winnerId}`);
			return true;

		}
		catch (err) {
			console.error(`pblm log la game tounoi dans le service, ::-->>>>>     ${err}`)
			return false;
		}
	}


}
