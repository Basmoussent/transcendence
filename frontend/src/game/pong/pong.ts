import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { PaddleAI } from "./paddle-ai";
import { PADDLE_OFFSET, PADDLE1_COLOR, PADDLE2_COLOR } from "./const";


interface player1{
	name : string;
	score: number;
}

export class Pong {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private start: boolean;
	private end: boolean;
	private lastPlayerColl: number; // pour savoir qui va gagner le point
	private paddles: [Paddle, Paddle | PaddleAI];
	private ball: Ball;
	private keys: { [key: string]: boolean };

	// constructor(canvas: HTMLCanvasElement, player1ID: number, player2ID: number) {
	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2D context');
		}

		this.ctx = context;
		this.height = canvas.height;
		this.width = canvas.width;
		this.start = false;
		this.end = false;
		this.lastPlayerColl = -1;

		// !!! modifier ca avec les infos de la partie
		this.paddles = [
			new Paddle(20, 100, PADDLE1_COLOR),
			new Paddle(20, 100, PADDLE2_COLOR),
		];

		this.ball = new Ball(this.height, this.width);
		this.keys = {};
	}

	public init(): { player1: player1, player2: player1 } {
		console.log('Initializing paddle game...');
		this.setupCanvas();
		this.setupEventListeners();
		this.startGameLoop();

		// on resize si la taille de la fenetre change
		window.addEventListener('resize', () => {
			this.setupCanvas();
		});

		const player1 = {name: this.paddles[0].name, score: this.paddles[0].score} as player1;
		const player2 = {name: this.paddles[1].name, score: this.paddles[1].score} as player1;
		return {player1, player2};
	};
	// positions et tailles de base en fonction de la taille du canvas
	private setupPaddles(): void {
		console.log('Setting up paddles...');
		this.paddles[0].x = PADDLE_OFFSET;
		this.paddles[0].y = (this.height - this.paddles[0].height) / 2;

		this.paddles[1].x = this.width - this.paddles[1].width - PADDLE_OFFSET;
		this.paddles[1].y = (this.height - this.paddles[1].height) / 2;
	}

	private setupCanvas(): void {
		console.log('Setting up canvas...');
		console.log('this.width = ', this.width)
		console.log('this.height = ', this.height)
		this.canvas.width = this.canvas.clientWidth || 800;
		this.canvas.height = this.canvas.clientHeight || 600;
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		this.setupPaddles();

		this.ball.radius = this.paddles[0].width / 2;
		this.ball.x = this.width / 2;
		this.ball.y = this.height / 2;
	}

	// pendant qu'on appuie sur une touche this.keys[touche] = true
	private setupEventListeners(): void {
		window.addEventListener('keydown', (e) => {
			this.keys[e.key.toLowerCase()] = true;
		});

		window.addEventListener('keyup', (e) => {
			this.keys[e.key.toLowerCase()] = false;
		});
	}

	private async startGameLoop(): Promise<void> {
	console.log('Starting game loop...');

	// fleche au lieu de function() pour que this fasse ref a Pong
	const gameLoop = () => {
			if (this.keys['enter'])
				this.start = true;
			if (this.start && !this.end) {
				this.update();
			}
			this.render();
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}

	private displayStartMsg(): void {
		this.ctx.globalAlpha = 0.2;
		this.ctx.fillStyle = 'white';
		this.ctx.font = '48px sans-serif'; // changer police
		this.ctx.fillText('PRESS ENTER', this.width / 2 - 150, this.height / 2 - 30);
		this.ctx.fillText('TO START', this.width / 2 - 100, this.height / 2 + 50);
		this.ctx.globalAlpha = 1;
		}

		private drawLine(): void {
		this.ctx.globalAlpha = 0.2;
		this.ctx.beginPath();
		this.ctx.moveTo(this.width / 2, 30);
		this.ctx.lineTo(this.width / 2, this.height - 30);
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
		this.ctx.globalAlpha = 1;
	}

	private displayScore(): void {
		// ligne du milieu
		this.drawLine();

		// les scores
		this.paddles[0].displayScore(this.ctx, (this.width / 2) / 2, this.height / 2);
		this.paddles[1].displayScore(this.ctx, (this.width / 4) * 3, this.height / 2);
	}

	private displayResult(): void {
		this.ctx.globalAlpha = 0.2;
		this.ctx.fillStyle = 'white';
		this.ctx.font = '48px sans-serif'; // changer police

		this.ctx.globalAlpha = 1;
	}

	private startPoint(): void {
		const paddle = this.paddles[this.lastPlayerColl];
		if (paddle)
			paddle.score++;

		// faut faire un POST pour update score et etat de la partie
		for (let i = 0; i < 4; i++) {
			const paddle = this.paddles[i];
			if (paddle && paddle?.winsGame() === true) {
			this.end = true;
			return;
			}
		}

		this.ball.resetBallInfo(this.width, this.height, this.lastPlayerColl);
		// celui qui gagne recoit la balle en premier

		// le point est rejoue si personne ne touche la balle
		this.lastPlayerColl = -1;
	}

	private ballPaddleCollision(): void {
		if (this.ball.x - this.ball.radius <= this.paddles[0].x + this.paddles[0].width && this.ball.y + this.ball.radius >= this.paddles[0].y && this.ball.y - this.ball.radius <= this.paddles[0].y + this.paddles[0].height && this.ball.x > this.paddles[0].x) {
			this.ball.speedX *= -1;
			this.ball.adjustBallDir(this.paddles[0]);
			this.ball.addBallSpeed();
			this.ball.x = this.paddles[0].x + this.paddles[0].width + this.ball.radius;

			this.lastPlayerColl = 0;
		}
		if (this.ball.x + this.ball.radius >= this.paddles[1].x && this.ball.y + this.ball.radius >= this.paddles[1].y && this.ball.y - this.ball.radius <= this.paddles[1].y + this.paddles[1].height && this.ball.x < this.paddles[1].x + this.paddles[1].width) {
			this.ball.speedX *= -1;
			this.ball.adjustBallDir(this.paddles[1]);
			this.ball.addBallSpeed();
			this.ball.x = this.paddles[1].x - this.ball.radius;

			this.lastPlayerColl = 1;
		}
	}

	private updateBall(ball: typeof this.ball): void {

		ball.x += ball.speedX;
		ball.y += ball.speedY;

		// check paddles collision + la balle prends en vitesse a chaque collision paddle + ajuster dir
		this.ballPaddleCollision();

		// check scored point et relancer si oui
		if (ball.x - ball.radius > this.width || ball.x + ball.radius <= 0)
			this.startPoint();

		// check wall collision haut
		if (ball.y - ball.radius <= 0)
			ball.speedY *= -1;

		// check wall collision bas
		if (ball.y + ball.radius >= this.height)
			ball.speedY *= -1;
	}

	private	updatePlayer1(): void {
			this.paddles[0].updatePaddleRightLeft(this.keys, 'w', 's', this.height);
	}

	private	updatePlayer2(): void {
		if (this.paddles[1] instanceof PaddleAI)
			this.paddles[1].botPlayer(this.ball, this.height);
		else
			this.paddles[1].updatePaddleRightLeft(this.keys, 'arrowup', 'arrowdown', this.height);
	}

	private update(): void {
		this.updatePlayer1();
		this.updatePlayer2();

		this.updateBall(this.ball);
	}

	private render(): void {

		// on efface tout
		this.ctx.clearRect(0, 0, this.width, this.height);

		// le fond
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);

		// les paddles + leur contour
		for (let i = 0; i < 4; i++) {
			const paddle = this.paddles[i];
			if (paddle)
			this.paddles[i]?.drawPaddle(this.ctx);
		}

		if (this.start && !this.end) {
			this.ball.drawBall(this.ctx, this.ball.x, this.ball.y, this.ball.radius);
			this.displayScore();
		}
		else {
			if (this.end)
				this.displayResult();
			else
				this.displayStartMsg();
		}
	}
}
