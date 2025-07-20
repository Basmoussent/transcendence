import { brick, Ball, Paddle, createRandomBrick } from "./blockUtils.ts";
import { getAuthToken } from '../../utils/auth.ts'
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

export class Block1v1 {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private winner: string;
	private status: boolean;
	private username: string;
	private brickHeight: number;
	private brickWidth: number;
	private ball1: Ball;
	private ball2: Ball;
	private paddle1: Paddle;
	private paddle2: Paddle;
	private bricks: brick[] = [];
	private keys: { [key: string]: boolean };

	private data: any;

	constructor(canvas: HTMLCanvasElement, uuid: string) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');

		if (!context)
			throw new Error('Could not get 2D context');

		this.retrieveGameInfo(uuid);

		this.ctx = context;
		this.width = canvas.width;
		this.height = canvas.height;
		this.winner = "nobody";
		this.username = "ko";
		this.status = false;

		this.brickWidth = 0;
		this.brickHeight = 0;

		this.paddle1 = new Paddle(0, 0, 8);
		this.paddle2 = new Paddle(0, 0, 8);
		this.ball1 = new Ball(0, 0);
		this.ball2 = new Ball(0, 0);

		this.keys = {};
		this.bricks = [];
	}

	public init(): void {
		this.setupCanvas();
		this.setupEventListeners();
		this.startGameLoop();
	}

	private setupEventListeners(): void {
		window.addEventListener('resize', () => {
			this.setupCanvas();
		});
		window.addEventListener('keydown', (e) => {
			this.keys[e.key.toLowerCase()] = true;
		});
		window.addEventListener('keyup', (e) => {
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

		this.data = {
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

		console.log(`les infos de la game => ${JSON.stringify(this.data, null, 12)}`)
	}
  
	private setupCanvas(): void {
		this.canvas.width = this.canvas.clientWidth || 800;
		this.canvas.height = this.canvas.clientHeight || 600;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		
		// Positionner les paddles
		this.paddle1.x = (this.width - this.paddle1.width) / 2;
		this.paddle1.y = this.height - this.paddle1.height - 20;

		this.paddle2.x = (this.width - this.paddle2.width) / 2;
		this.paddle2.y = 20;

		// Calculer la taille des briques
		this.brickWidth = this.width / 20;
		this.brickHeight = Math.floor(this.height / 20);

		// Positionner les balles
		this.ball1.x = this.width / 2;
		this.ball1.y = this.height - 100;

		this.ball2.x = this.width / 2;
		this.ball2.y = 100;
	}
  
	private startGameLoop(): void {
		const gameLoop = () => {
			this.update();
			this.render();
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}

	private displayStartMsg(): void {
		if (this.status) return;
		
		this.ctx.globalAlpha = 0.8;
		this.ctx.fillStyle = 'white';
		this.ctx.font = '32px Arial';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(t('block.pressEnterToStart'), this.width / 2, this.height / 2);
		this.ctx.fillText(t('block.player1Controls'), this.width / 2, this.height / 2 + 40);
		this.ctx.fillText(t('block.player2Controls'), this.width / 2, this.height / 2 + 80);
		this.ctx.globalAlpha = 1;
	}

	private checkBrickCollision(ball: Ball): void {
		// Zone des briques (milieu de l'écran)
		const brickZoneTop = this.height / 3;
		const brickZoneBottom = (this.height / 3) * 2;
		
		if (ball.y + ball.radius >= brickZoneTop && ball.y - ball.radius <= brickZoneBottom) {
			for (const brick of this.bricks) {
				if (brick.getHp() <= 0) continue;
				
				const brickLeft = brick.getX() * this.brickWidth;
				const brickRight = brickLeft + this.brickWidth;
				const brickTop = brick.getY() * this.brickHeight + brickZoneTop;
				const brickBottom = brickTop + this.brickHeight;
				
				if (ball.checkBrickCollision(brickLeft, brickRight, brickTop, brickBottom)) {
					brick.beenHit();
					ball.bounceOnBrick(brickLeft, brickRight, brickTop, brickBottom);
					break; // Une seule collision par frame
				}
			}
		}
	}

	private update(): void {
		// Démarrer le jeu
		if (this.keys['enter'] && !this.status) {
			this.ball1.reset(this.width / 2, this.height - 100, 4, -4);
			this.ball2.reset(this.width / 2, 100, -4, 4);
			this.status = true;

			// Créer les briques
			this.bricks = [];
			for (let i = 0; i < 100; i++) {
				this.bricks.push(createRandomBrick(i, i % 20, Math.floor(i / 20)));
			}
		}

		if (!this.status) return;

		// Mettre à jour les dimensions des briques
		this.brickWidth = this.width / 20;
		this.brickHeight = Math.floor(this.height / 20);

		// Contrôles des paddles
		if (this.keys['a']) {
			this.paddle1.move("left", this.width);
		}
		if (this.keys['d']) {
			this.paddle1.move("right", this.width);
		}

		if (this.keys['arrowleft']) {
			this.paddle2.move("left", this.width);
		}
		if (this.keys['arrowright']) {
			this.paddle2.move("right", this.width);
		}

		// Collisions avec les paddles
		// Balle 1 (du bas) - collision avec paddle du bas (rebond vers le haut)
		this.ball1.collisionPaddle(this.paddle1);
		// Balle 2 (du haut) - collision avec paddle du haut (rebond vers le bas)
		this.ball2.collisionPaddleTop(this.paddle2);

		// Collisions avec les briques
		this.checkBrickCollision(this.ball1);
		this.checkBrickCollision(this.ball2);

		// Collisions avec les bords de l'écran
		this.ball1.collisionWindow(this.width, this.height);
		this.ball2.collisionWindow(this.width, this.height);

		// Vérifier la fin de partie
		if (this.checkGameEnd()) {
			this.status = false;
		}

		// Déplacer les balles
		this.ball1.move();
		this.ball2.move();
	}

	private checkGameEnd(): boolean {
		// Joueur 1 perd si balle 1 touche le bas
		if (this.ball1.y + this.ball1.radius >= this.height) {
			this.winner = "Player 2";
			return true;
		}
		// Joueur 2 perd si balle 2 touche le haut
		if (this.ball2.y - this.ball2.radius <= 0) {
			this.winner = "Player 1";
			return true;
		}
		return false;
	}

	private renderBricks(): void {
		const brickZoneTop = this.height / 3;
		
		for (const brick of this.bricks) {
			if (brick.getHp() <= 0) continue;

			this.ctx.fillStyle = brick.getColor();
			this.ctx.fillRect(
				brick.getX() * this.brickWidth,
				brick.getY() * this.brickHeight + brickZoneTop,
				this.brickWidth - 1,
				this.brickHeight - 1
			);
		}
	}

	private drawBall(ball: Ball, color: string): void {
		this.ctx.beginPath();
		this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		this.ctx.fillStyle = color;
		this.ctx.fill();
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
		this.ctx.closePath();
	}

	private drawPaddle(paddle: Paddle, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(
			paddle.x,
			paddle.y,
			paddle.width,
			paddle.height
		);
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(
			paddle.x,
			paddle.y,
			paddle.width,
			paddle.height
		);
	}

	private render(): void {
		// Effacer le canvas
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		// Fond
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		// Ligne de séparation
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.setLineDash([10, 10]);
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.height / 2);
		this.ctx.lineTo(this.width, this.height / 2);
		this.ctx.stroke();
		this.ctx.setLineDash([]);
		
		// Dessiner les éléments
		this.renderBricks();
		this.drawPaddle(this.paddle1, '#84AD8A'); // Paddle du bas
		this.drawPaddle(this.paddle2, '#84A6AD'); // Paddle du haut
		this.drawBall(this.ball1, '#FF8600'); // Balle du bas
		this.drawBall(this.ball2, '#FF6B6B'); // Balle du haut
		
		// Message de début
		this.displayStartMsg();
		
		// Afficher le gagnant
		if (!this.status && this.winner !== "nobody") {
			this.ctx.globalAlpha = 0.9;
			this.ctx.fillStyle = 'white';
					this.ctx.font = '48px Arial';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(`${this.winner} ${t('block.wins')}`, this.width / 2, this.height / 2);
		this.ctx.font = '24px Arial';
		this.ctx.fillText(t('block.pressEnterToPlayAgain'), this.width / 2, this.height / 2 + 50);
			this.ctx.globalAlpha = 1;
		}
	}
}
