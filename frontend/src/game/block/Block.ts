import { fetchUsername, logEndGame, logStartGame, postGame } from "../gameUtils.ts";
import { Ball, Paddle, brick, createRandomBrick, PowerUp, PowerUpType, getPowerUpFromBrick } from "./blockUtils.ts";
import { getAuthToken } from '../../utils/auth.ts'
import { addEvent } from '../../utils/eventManager.ts';
import { t } from '../../utils/translations.ts'

export interface Game {
	id: number,
	uuid: string,
	game_type: string,
	player1: string,
	player2: string,
	player3: string,
	player4: string,
	ai: number,
	users_needed: number,
}

export class Block {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private uuid: string;
	private width: number;
	private height: number;
	private status: boolean;
	private username: string;
	private winner: string;
	private win: boolean;
	private lost: boolean;
	private brickHeight: number;
	private brickWidth: number;
	private ball: Ball;
	private paddle: Paddle;
	private bricks: brick[] = [];
	private keys: { [key: string]: boolean };

	private data: any;
  
	constructor(canvas: HTMLCanvasElement, uuid: string) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');

		if (!context)
			throw new Error('Could not get 2D context');

		this.ctx = context;
		this.width = canvas.width;
		this.height = canvas.height;
		this.winner = 'nil';
		this.uuid = uuid;
		this.win = false;
		this.lost = false;
		this.username = "ko";
		this.status = false;

		this.paddle = new Paddle(0, 0, 8);
		this.ball = new Ball(0, 0);
		this.keys = {};
		this.bricks = [];
		this.brickWidth = 0;
		this.brickHeight = 0;


		this.asyncInit();
	}

	public async asyncInit(): Promise<void> {
		this.data = await this.loadInfo(this.uuid);
        console.log("data dans asyncInit", this.data);

		this.loadUsername();
		this.setupCanvas();
		this.setupEventListeners();
		logStartGame(this.data.id); // start ici
		this.startGameLoop();
	}

	private async loadInfo(uuid: string): Promise<any> {
            let tmp = await this.retrieveGameInfo(uuid);
            
            return tmp;
    }

	private async loadUsername() {
		try {
			const name = await fetchUsername();
			this.username = name || 'unknown';
		}
		catch (err) {
			console.error("Erreur fetchUsername :", err);
		}
	}

	private setupEventListeners(): void {
		addEvent(window, 'resize', () => {
			this.setupCanvas();
		});
		addEvent(window, 'keydown', (e) => {
			this.keys[e.key.toLowerCase()] = true;
		});
		addEvent(window, 'keyup', (e) => {
			this.keys[e.key.toLowerCase()] = false;
		});
	}

	private async retrieveGameInfo(uuid: string) {

		const authToken = getAuthToken()
		if (!authToken) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return;
		}

		const response = await fetch(`/api/games/?uuid=${uuid}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': authToken
				},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.details || "pblm recuperer les infos de la game le multipong");
		}

		const result = await response.json();

		const data = {
			id: result.game.id,
			uuid: result.game.uuid,
			game_type: result.game.game_type,
			player1: result.game.player1,
			player2: result.game.player2,
			player3: result.game.player3,
			player4: result.game.player4,
			users_needed: result.game.users_needed,
			ai: result.game.ai,
		}

		console.log(`les infos de la game => ${JSON.stringify(data, null, 12)}`)

		return data;
	}
  
	private setupCanvas(): void {
		this.canvas.width = this.canvas.clientWidth || 800;
		this.canvas.height = this.canvas.clientHeight || 600;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		
		// Positionner la paddle
		this.paddle.x = (this.width - this.paddle.width) / 2;
		this.paddle.y = this.height - this.paddle.height - 20;

		// Calculer la taille des briques
		this.brickWidth = this.width / 20;
		this.brickHeight = Math.floor(this.height / 20);

		// Positionner la balle
		this.ball.x = this.width / 2;
		this.ball.y = this.height - 100;
	}

	private async startGameLoop(): Promise<void> {
		const gameLoop = async () => {
			this.update();
			this.render();

			if (this.win || this.lost) {
				this.logGame();
        		const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

				await sleep(3000);

                window.history.pushState({}, '', '/main');
                window.dispatchEvent(new PopStateEvent('popstate'));
                return;
			}
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}

	private async logGame() {

		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Token d\'authentification manquant');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return -1;
			}

			const response = await fetch(`/api/games/finish/${this.uuid}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
				body: JSON.stringify({
					winner: this.winner
				})
			});
		
			if (response.ok) {
				const result = await response.json();
				console.log("la game de room est log", result);
			}
			else 
				console.error("erreur pour log la game de room");
		}
		catch (err) {
			console.error("pblm dans Block.ts pour log la game")
		}
	}

	private displayStartMsg(): void {
		if (this.status) return;
		
		this.ctx.globalAlpha = 0.8;
		this.ctx.fillStyle = 'white';
		this.ctx.font = '32px gaming';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(t('block.pressEnterToStart'), this.width / 2, this.height / 2);
		this.ctx.globalAlpha = 1;
	}

	private updateWin(): void {
		for (const brick of this.bricks) {
			if (brick.getHp() > 0) return;
		}
		this.win = true;
		this.winner = this.username;
	}

	private updateLose(): void {
		if (this.ball.y + this.ball.radius >= this.height) {
			this.lost = true;
		}
	}

	private async update(): Promise<void> {
		// Démarrer le jeu
		if (this.keys['enter'] && !this.status) {
			this.ball.reset(this.width / 2, this.height - 100, 4, -4);
			this.status = true;

			// this.uuid = await postGame({
			// 	game_type: "block",
			// 	player1: this.username,
			// 	users_needed: 1
			// });

			// logStartGame(this.data.id);

			// Créer les briques
			this.bricks = [];
			for (let i = 0; i < 1; i++) {
				this.bricks.push(createRandomBrick(i, i % 20, Math.floor(i / 20)));
			}
		}

		if (!this.status) return;

		// Mettre à jour les dimensions des briques
		this.brickWidth = this.width / 20;
		this.brickHeight = Math.floor(this.height / 20);

		// Contrôles de la paddle
		if (this.keys['a'] || this.keys['arrowleft']) {
			this.paddle.move("left", this.width);
		}
		if (this.keys['d'] || this.keys['arrowright']) {
			this.paddle.move("right", this.width);
		}

		// Collision avec la paddle
		this.ball.collisionPaddle(this.paddle);

		// Collision avec les briques
		for (const brick of this.bricks) {
			if (brick.getHp() <= 0) continue;

			const brickLeft = brick.getX() * this.brickWidth;
			const brickRight = brickLeft + this.brickWidth;
			const brickTop = brick.getY() * this.brickHeight;
			const brickBottom = brickTop + this.brickHeight;

			if (this.ball.checkBrickCollision(brickLeft, brickRight, brickTop, brickBottom)) {
				brick.beenHit();
				this.ball.bounceOnBrick(brickLeft, brickRight, brickTop, brickBottom);
				
				this.updateWin();
				break; // Une seule collision par frame
			}
		}

		// Collision avec les bords de l'écran
		this.ball.collisionWindow(this.width, this.height);

		// Vérifier la défaite
		this.updateLose();

		// Fin de partie
		if (this.win || this.lost) {
			this.status = false;
			// await logEndGame(this.data.id, this.winner);
			// this.win = false;
			// this.lost = false;
		}

		// Déplacer la balle
		this.ball.move();
	}

	private renderBricks(): void {
		for (const brick of this.bricks) {
			if (brick.getHp() <= 0) continue;

			this.ctx.fillStyle = brick.getColor();
			this.ctx.fillRect(
				brick.getX() * this.brickWidth,
				brick.getY() * this.brickHeight,
				this.brickWidth - 1,
				this.brickHeight - 1
			);
		}
	}

	private drawPaddle(): void {
		// Couleur de la paddle selon les effets actifs
		let paddleColor = '#84AD8A';
		
		this.ctx.fillStyle = paddleColor;
		this.ctx.fillRect(
			this.paddle.x,
			this.paddle.y,
			this.paddle.width,
			this.paddle.height
		);
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(
			this.paddle.x,
			this.paddle.y,
			this.paddle.width,
			this.paddle.height
		);
	}

	private drawBall(): void {
		// Couleur de la balle selon les effets actifs
		let ballColor = '#FF8600';
		
		this.ctx.beginPath();
		this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
		this.ctx.fillStyle = ballColor;
		this.ctx.fill();
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
		this.ctx.closePath();
	}
  
	private render(): void {
		// Effacer le canvas
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		// Fond
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		this.drawBall();
		this.drawPaddle();
		if (this.status) {
			// Dessiner les éléments
			this.renderBricks();
		}
		else
			this.displayStartMsg();
	}
}
