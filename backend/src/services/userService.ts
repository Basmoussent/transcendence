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
		const user = await this.findById(id);
		if (user) {
			return redis.get(`alive:${id}`);
		}
		return false;
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
			const user = await new Promise<UserData | null>((resolve, reject) => {
				this.db.get(
					'SELECT * FROM statistics WHERE username = ?', // tu te basais sur le user_id mais le champs dans la db c'est username zignew
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
}

function generateOtpAuthUrl(secret_key: string, email: string, issuer: string) {
	return `otpauth://totp/${issuer}:${email}?secret=${secret_key}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}