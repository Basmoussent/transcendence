import { redis } from '../index';
import { db } from '../database';
import QRCode from 'qrcode';
import { authenticator } from 'otplib';

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
		try {
			const user = await this.findById(id);
			if (user) {
				// Vérifier le statut par ID et par username
				const isOnlineById = await redis.exists(`${id}:online`);
				const isOnlineByUsername = await redis.exists(`${user.username}:online`);
				return isOnlineById || isOnlineByUsername;
			}
			return false;
		} catch (error) {
			console.error('❌ Error checking online status:', error);
			return false;
		}
	}

	async generateQrcode(user: any) {
		try {
		// recup mail et secret_key du user
			const userEmail = user.email;

			const userSecretKey: string = await new Promise<string>((resolve, reject) => {
				this.db.get(
					'SELECT secret_key FROM users WHERE email = ?',
					[ userEmail ],
					(err: any, row: any | undefined) => {
					err ? reject(err) : resolve(row); }
				);
			});

			if (!userSecretKey.secret_key)
				console.log('eteins la secret key est pas recup')

			// generer l'url otp qui sera utilisee pour le qrcode
			const otpUrl = generateOtpAuthUrl(userSecretKey.secret_key, userEmail, 'Transcendence');

			// generer et renvoyer le qrcode
			try {
				const qrCodeDataUrl = await QRCode.toDataURL(otpUrl, {
					width: 200,
					margin: 2,
					color: {
					dark: '#000000',
					light: '#FFFFFF'
					}
				});

				const tmp = `
					<div class="qr-code-container">
					<img src="${qrCodeDataUrl}" alt="2FA QRCode" style="border-radius: 10px;" />
					</div>
				`;
				return tmp;
			}
			catch (qrError) {
				console.error('Erreur lors de la génération du QR code:', qrError);
				return `
					<div class="qr-placeholder">
					<i class="fas fa-exclamation-triangle"></i>
					<p>Erreur lors de la génération du QR code</p>
					</div>
				`;
			}
		}
		catch (error) {
			console.error('Erreur lors du chargement des informations utilisateur:', error);
			return `
				<div class="qr-placeholder">
				<i class="fas fa-exclamation-triangle"></i>
				<p>Erreur lors du chargement</p>
				</div>
			`;
		}
	}

	async verifiyCode(userInputCode: string, secret: string): Promise<boolean> {
		console.log(`secret = ${secret} et code = ${userInputCode}`)
		return authenticator.check(userInputCode, secret);
	}

	async retrieveStats(username: string) {
		try {
			// Récupérer l'ID de l'utilisateur
			const user = await this.findByUsername(username);
			if (!user) {
				return {
					username: username,
					pong_games: 0,
					pong_wins: 0,
					block_games: 0,
					block_wins: 0,
					total_games: 0,
					total_wins: 0,
					rating: 0,
					mmr: 0
				};
			}

			// Calculer les statistiques à partir de la table history
			const stats = await new Promise<any>((resolve, reject) => {
				this.db.get(
					`SELECT 
						COUNT(CASE WHEN game_type = 'pong' THEN 1 END) as pong_games,
						COUNT(CASE WHEN game_type = 'pong' AND winner = ? THEN 1 END) as pong_wins,
						COUNT(CASE WHEN game_type = 'block' THEN 1 END) as block_games,
						COUNT(CASE WHEN game_type = 'block' AND winner = ? THEN 1 END) as block_wins,
						COUNT(*) as total_games,
						COUNT(CASE WHEN winner = ? THEN 1 END) as total_wins
					FROM history 
					WHERE (player1 = ? OR player2 = ? OR player3 = ? OR player4 = ?)
					AND end_time IS NOT NULL`,
					[user.id.toString(), user.id.toString(), user.id.toString(), user.id.toString(), user.id.toString(), user.id.toString(), user.id.toString()],
					(err: any, row: any | undefined) => {
						err ? reject(err) : resolve(row || {
							pong_games: 0,
							pong_wins: 0,
							block_games: 0,
							block_wins: 0,
							total_games: 0,
							total_wins: 0
						});
					}
				);
			});

			const totalGames = stats.pong_games + stats.block_games || 0;
			const totalWins = stats.pong_wins + stats.block_wins || 0;
			const winrate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
			console.log("winrate :", winrate);
			const rating = Math.round(winrate * 10); 

			return {
				username: username,
				pong_games: stats.pong_games || 0,
				pong_wins: stats.pong_wins || 0,
				block_games: stats.block_games || 0,
				block_wins: stats.block_wins || 0,
				total_games: totalGames,
				total_wins: totalWins,
				rating: rating,
				mmr: rating // MMR identique au rating pour l'instant
			};
		}
		catch (err: any) {
			console.log(`Erreur lors du calcul des stats pour ${username}:`, err);
			return {
				username: username,
				pong_games: 0,
				pong_wins: 0,
				block_games: 0,
				block_wins: 0,
				total_games: 0,
				total_wins: 0,
				rating: 0,
				mmr: 0
			};
		}
	}
}

function generateOtpAuthUrl(secret_key: string, email: string, issuer: string) {
	return `otpauth://totp/${issuer}:${email}?secret=${secret_key}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}