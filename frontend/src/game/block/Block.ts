import { fetchUsername, logEndGame, postGame } from "../gameUtils.ts";
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
	private uuid: number;
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
	private powerUps: PowerUp[] = [];
	private keys: { [key: string]: boolean };
	
	// Effets de power-ups
	private widePaddleActive: boolean = false;
	private widePaddleTimer: number = 0;
	private fastBallActive: boolean = false;
	private fastBallTimer: number = 0;
	private slowBallActive: boolean = false;
	private slowBallTimer: number = 0;

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
		this.uuid = -1;
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

		this.retrieveGameInfo(uuid);

		this.loadUsername();
		this.setupCanvas();
		this.setupEventListeners();
		this.startGameLoop();
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

	private updatePowerUps(): void {
		// Mettre à jour les power-ups
		for (let i = this.powerUps.length - 1; i >= 0; i--) {
			const powerUp = this.powerUps[i];
			
			if (!powerUp.active) {
				this.powerUps.splice(i, 1);
				continue;
			}
			
			// Déplacer le power-up
			powerUp.move();
			
			// Vérifier si le power-up sort de l'écran
			if (powerUp.y > this.height) {
				powerUp.active = false;
				continue;
			}
			
			// Vérifier collision avec la paddle
			if (this.checkPowerUpCollision(powerUp)) {
				this.applyPowerUp(powerUp);
				powerUp.active = false;
			}
		}
		
		// Mettre à jour les timers des effets
		this.updatePowerUpTimers();
	}

	private checkPowerUpCollision(powerUp: PowerUp): boolean {
		return powerUp.x + powerUp.width >= this.paddle.x &&
			   powerUp.x <= this.paddle.x + this.paddle.width &&
			   powerUp.y + powerUp.height >= this.paddle.y &&
			   powerUp.y <= this.paddle.y + this.paddle.height;
	}

	private applyPowerUp(powerUp: PowerUp): void {
		switch (powerUp.type) {
			case PowerUpType.EXPLOSION:
				this.applyExplosion();
				break;
			case PowerUpType.MULTI_BALL:
				this.applyMultiBall();
				break;
			case PowerUpType.WIDE_PADDLE:
				this.applyWidePaddle();
				break;
			case PowerUpType.FAST_BALL:
				this.applyFastBall();
				break;
			case PowerUpType.SLOW_BALL:
				this.applySlowBall();
				break;
		}
	}

	private applyExplosion(): void {
		// Détruire toutes les briques dans un rayon
		const explosionRadius = 100;
		for (const brick of this.bricks) {
			if (brick.getHp() <= 0) continue;
			
			const brickCenterX = brick.getX() * this.brickWidth + this.brickWidth / 2;
			const brickCenterY = brick.getY() * this.brickHeight + this.brickHeight / 2;
			const distance = Math.sqrt(
				Math.pow(this.ball.x - brickCenterX, 2) + 
				Math.pow(this.ball.y - brickCenterY, 2)
			);
			
			if (distance <= explosionRadius) {
				brick.beenHit();
				// Vérifier si la brique a un power-up
				const powerUp = getPowerUpFromBrick(brick, this.brickWidth, this.brickHeight);
				if (powerUp) {
					this.powerUps.push(powerUp);
				}
			}
		}
	}

	private applyMultiBall(): void {
		// Créer 2 balles supplémentaires
		const currentSpeed = Math.sqrt(this.ball.speedx * this.ball.speedx + this.ball.speedy * this.ball.speedy);
		
		// Balle 2
		const ball2 = new Ball(this.ball.x, this.ball.y);
		ball2.speedx = -this.ball.speedx;
		ball2.speedy = this.ball.speedy;
		// TODO: Ajouter la gestion des balles multiples
		
		// Balle 3
		const ball3 = new Ball(this.ball.x, this.ball.y);
		ball3.speedx = this.ball.speedx;
		ball3.speedy = -this.ball.speedy;
		// TODO: Ajouter la gestion des balles multiples
	}

	private applyWidePaddle(): void {
		this.widePaddleActive = true;
		this.widePaddleTimer = 300; // 5 secondes à 60 FPS
		this.paddle.width = 150; // Agrandir la paddle
	}

	private applyFastBall(): void {
		this.fastBallActive = true;
		this.fastBallTimer = 300; // 5 secondes
		this.ball.speedx *= 1.5;
		this.ball.speedy *= 1.5;
	}

	private applySlowBall(): void {
		this.slowBallActive = true;
		this.slowBallTimer = 300; // 5 secondes
		this.ball.speedx *= 0.7;
		this.ball.speedy *= 0.7;
	}

	private updatePowerUpTimers(): void {
		// Timer pour wide paddle
		if (this.widePaddleActive) {
			this.widePaddleTimer--;
			if (this.widePaddleTimer <= 0) {
				this.widePaddleActive = false;
				this.paddle.width = 100; // Retour à la taille normale
			}
		}
		
		// Timer pour fast ball
		if (this.fastBallActive) {
			this.fastBallTimer--;
			if (this.fastBallTimer <= 0) {
				this.fastBallActive = false;
				// Normaliser la vitesse
				const speed = Math.sqrt(this.ball.speedx * this.ball.speedx + this.ball.speedy * this.ball.speedy);
				if (speed > 6) {
					this.ball.speedx = (this.ball.speedx / speed) * 6;
					this.ball.speedy = (this.ball.speedy / speed) * 6;
				}
			}
		}
		
		// Timer pour slow ball
		if (this.slowBallActive) {
			this.slowBallTimer--;
			if (this.slowBallTimer <= 0) {
				this.slowBallActive = false;
				// Normaliser la vitesse
				const speed = Math.sqrt(this.ball.speedx * this.ball.speedx + this.ball.speedy * this.ball.speedy);
				if (speed < 6) {
					this.ball.speedx = (this.ball.speedx / speed) * 6;
					this.ball.speedy = (this.ball.speedy / speed) * 6;
				}
			}
		}
	}

	private async update(): Promise<void> {
		// Démarrer le jeu
		if (this.keys['enter'] && !this.status) {
			this.ball.reset(this.width / 2, this.height - 100, 4, -4);
			this.status = true;

			this.uuid = await postGame({
				game_type: "block",
				player1: this.username,
				users_needed: 1
			});

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
				
				// Vérifier si la brique a un power-up
				const powerUp = getPowerUpFromBrick(brick, this.brickWidth, this.brickHeight);
				if (powerUp) {
					this.powerUps.push(powerUp);
				}
				
				this.updateWin();
				break; // Une seule collision par frame
			}
		}

		// Gestion des power-ups
		this.updatePowerUps();

		// Collision avec les bords de l'écran
		this.ball.collisionWindow(this.width, this.height);

		// Vérifier la défaite
		this.updateLose();

		// Fin de partie
		if (this.win || this.lost) {
			this.status = false;
			await logEndGame(this.uuid, this.winner);
			this.win = false;
			this.lost = false;
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
		if (this.widePaddleActive) {
			paddleColor = '#4444FF'; // Bleu quand agrandie
		}
		
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

	private drawPowerUps(): void {
		for (const powerUp of this.powerUps) {
			if (!powerUp.active) continue;
			
			// Dessiner le fond du power-up
			this.ctx.fillStyle = powerUp.getColor();
			this.ctx.fillRect(
				powerUp.x,
				powerUp.y,
				powerUp.width,
				powerUp.height
			);
			
			// Dessiner le symbole
			this.ctx.fillStyle = '#ffffff';
			this.ctx.font = '16px Arial';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(
				powerUp.getSymbol(),
				powerUp.x + powerUp.width / 2,
				powerUp.y + powerUp.height / 2 + 5
			);
			
			// Contour
			this.ctx.strokeStyle = '#ffffff';
			this.ctx.lineWidth = 2;
			this.ctx.strokeRect(
				powerUp.x,
				powerUp.y,
				powerUp.width,
				powerUp.height
			);
		}
	}

	private drawBall(): void {
		// Couleur de la balle selon les effets actifs
		let ballColor = '#FF8600';
		if (this.fastBallActive) {
			ballColor = '#FFFF44'; // Jaune quand rapide
		} else if (this.slowBallActive) {
			ballColor = '#FF44FF'; // Magenta quand lente
		}
		
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
		
		// Dessiner les éléments
		this.renderBricks();
		this.drawPaddle();
		this.drawBall();
		this.drawPowerUps();
		
		// Message de début
		this.displayStartMsg();
	}
}
