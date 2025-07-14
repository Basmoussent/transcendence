import { brick, Ball, Paddle, createRandomBrick,  } from "./blockUtils.ts"
import { postGame, logStartGame, logEndGame, fetchUsername } from "../gameUtils.ts";

export class Block {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private gameId: number

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
  
	constructor(canvas: HTMLCanvasElement) {

		console.log(" token recu");

		this.canvas = canvas;
		const context = canvas.getContext('2d');

		this.status = false;

		if (!context)
			throw new Error('Could not get 2D context');

		this.ctx = context;
		this.width = canvas.width;
		this.height = canvas.height;

		this.winner = 'nil';
		this.gameId = -1;
		this.win = false;
		this.lost = false;
		this.username = "ko";
		this.loadUsername();

		this.paddle = new Paddle(0, 0, 14);
		this.ball = new Ball(0, 0); // this.width et this.height are false

		this.keys = {};
		this.bricks = [];
		
		this.brickWidth = 0;
		this.brickHeight = 0;

		// for (let it = 0; it < 100; ++it)
		// 	console.log(this.bricks[it].getX(), ".", this.bricks[it].getY());

		this.setupCanvas();
		this.setupEventListeners();
		this.startGameLoop();
	}

	private async loadUsername() {
		try {
			const name = await fetchUsername();
			this.username = name || 'unknown';
			console.log("C'est MOI", this.username);
		}
		catch (err) {
			console.error("Erreur fetchUsername :", err); }
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
  
	private setupCanvas(): void {
		console.log('Setting up canvas...');
		this.canvas.width = this.canvas.clientWidth || 800;
		this.canvas.height = this.canvas.clientHeight || 600;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		
		this.paddle.x = (this.width - this.paddle.width) / 2;
		this.paddle.y = this.height - this.paddle.height - 12;

		this.brickWidth = this.width / 20;
		this.brickHeight = Math.floor(this.height / 20);

		this.ball.x = this.width / 2;
		this.ball.y = (this.height / 4) + 50;


		console.log('Canvas size:', this.width, this.height);
		console.log('Paddle position:', this.paddle.x, this.paddle.y);
	}
  
	private startGameLoop(): void {
		console.log('Starting game loop...');
		const gameLoop = () => {
			this.update(this.ball);
			this.render();
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}

	private displayStartMsg(ctx: typeof this.ctx): void {
		if (this.status)
			return;
		ctx.globalAlpha = 0.2;
		ctx.fillStyle = 'white';
		ctx.font = '48px sans-serif'; // changer police
		ctx.fillText('PRESS ENTER', this.width / 2 - 150, this.height / 2 - 30);
		ctx.fillText('TO START', this.width / 2 - 100, this.height / 2 + 50);
		ctx.globalAlpha = 1;
	}

	private updateWin() {

		for (const brick of this.bricks)
			if (brick.getHp())
				return;

		this.win = true;
		this.winner = this.username;
	}

	private updateLose() {
		if (this.ball.y - this.ball.radius >= this.height)
			this.lost = true;
	}


	private async update(ball: Ball) {

		if (this.keys['enter'] && !this.status) {
			
			ball.reset(this.width / 2, (this.height / 4) + 50, 10, 12)
			this.status = true;

			this.gameId = await postGame(this.username);
			// proteger si on arrive pas
			this.bricks = [];
			for (let it = 0; it < 100; ++it)
				this.bricks.push(createRandomBrick(it, it % 20, Math.floor(it / 20)));
		}

		if (!this.status)
			return ;

		this.brickWidth = this.width / 20;
		this.brickHeight = Math.floor(this.height / 20);

		if (this.keys['a']) 
			this.paddle.move("left", this.width)
		if (this.keys['d'])
			this.paddle.move("right", this.width)

		ball.collisionPadd1(this.paddle);

		// collision ball bricks
		if (ball.y + ball.speedy - (ball.radius / 2) <= this.height / 4 && ball.y > 0) {

			for (const brick of this.bricks) {

				if (brick.getHp()) {
					const brickLeft = brick.getX() * this.brickWidth;
					const brickRight = brickLeft + this.brickWidth;
					const brickTop = brick.getY() * this.brickHeight;
					const brickBottom = brickTop + this.brickHeight;
					
					if (ball.x - ball.radius / 2 >= brickLeft && ball.x + ball.radius / 2 <= brickRight &&
						ball.y - ball.radius / 2 >= brickTop && ball.y + ball.radius / 2 <= brickBottom) {

						brick.beenHit();
						this.updateWin();
						ball.moveTo(ball.x, (brick.getY() * this.brickHeight) + this.brickHeight + ball.radius);
						ball.speedy *= -1;

						break;
					}
				}
			}
		}

		ball.collisionWindow(this.width, true);
		this.updateLose();

		if (this.win || this.lost) {
			this.status = false;
			logEndGame(this.gameId, this.username);
			this.win = false;
			this.lost = false;
		}

		ball.move();
	}

	private renderBricks() {

		for (const brick of this.bricks) {

			if (!brick.getHp())
				continue ;

			this.ctx.fillStyle = brick.getColor();
			this.ctx.fillRect(brick.getX() * this.brickWidth, brick.getY() * this.brickHeight, this.brickWidth + 1, this.brickHeight + 1);
		}
	}

	private drawBall(ball: typeof this.ball): void {
		this.ctx.beginPath();
		this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		this.ctx.fillStyle = '#FF8600';
		this.ctx.fill();

		// centre de la ball
		this.ctx.fillStyle = '#DED6D6';
		this.ctx.fillRect(ball.x - 4, ball.y - 4, 8, 8);
		//

		this.ctx.fillStyle = '#ffffff';
		this.ctx.closePath();
	}
  
	private render(): void {
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		// fenetre de jeu
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		// paddle
		this.ctx.fillStyle = '#84AD8A';
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

		
		this.renderBricks();
		this.drawBall(this.ball);
		this.displayStartMsg(this.ctx);

	}

	
}
