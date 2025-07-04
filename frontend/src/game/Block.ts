import { brick, Ball, Paddle, createRandomBrick, fetchUsername } from "./blockUtils.ts"

export class Block {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private howMuchBricks: number;
	private brickHeight: number;
	private y_bricks_area: number;
	private status: boolean;
	private username: string;

	private ball: Ball;
	private paddle: Paddle;
	private bricks: brick[] = [];

	private keys: { [key: string]: boolean };
  
	constructor(canvas: HTMLCanvasElement) {

		this.canvas = canvas;
		const context = canvas.getContext('2d');

		this.status = false;

		if (!context)
			throw new Error('Could not get 2D context');

		this.ctx = context;
		this.width = canvas.width;
		this.height = canvas.height;
		this.howMuchBricks = 100;
		this.brickHeight = 0;
		this.y_bricks_area = 0;
		this.username = "ko";
		this.loadUsername();

		this.keys = {};
		this.bricks = [];

		this.paddle = new Paddle(0, 0, 100, 20, 14);
		this.ball = new Ball(this.width / 2, this.height / 2, 10); // this.width et this.height are false

	}

	// private brickId(x: number, y: number): number {

	// 	return (0);
	// }

	private async loadUsername() {
		try {
			const name = await fetchUsername();
			this.username = name || 'unknown';
			console.log("C'est MOI", this.username);
		}
		catch (err) {
			console.error("Erreur fetchUsername :", err); }
	}
  
	public init(): void {

		console.log('Initializing paddle game...');

		this.setupCanvas();
		this.setupEventListeners();
		this.startGameLoop();
			
		window.addEventListener('resize', () => {
			this.setupCanvas();
		});
	}

	private setupEventListeners(): void {
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
		this.paddle.y = this.height - this.paddle.height - 12; // 20 de base

		// this.brickHeight = 
		
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

	private update(ball: typeof this.ball): void {

		if (this.keys['enter'] && !this.status) {
			this.bricks = [];
			for (let it = 0; it < this.howMuchBricks; ++it)
				this.bricks.push(createRandomBrick(it));
			this.status = true;
		}

		if (!this.status) {
			this.ball.reset(this.width / 2, this.height / 2, 10)
			return ;
		}

		if (this.keys['p']) {
			if (this.ball.flag)
				this.ball.flag = false;
			else 
				this.ball.flag = true;
		}

		if (this.keys['a']) 
			this.paddle.move("left", this.width)
		if (this.keys['d'])
			this.paddle.move("right", this.width)

		this.ball.collisionPadd(this.paddle);
		this.ball.collisionWindow(this.width);

		// collisions ball -> bricks
		// if (ball.speedy < 0 && ball.y - ball.radius + ball.speedy <= this.height / 4) {

		// 	var id = this.brickId(ball.x, ball.y)

		// 	if (this.bricks[id].getHp()) {
		// 		this.bricks[id].beenHit();
		// 		ball.speedy *= -1;
		// 		// if (!this.brick[id].getHp())
		// 			// on vient de casser une brick
		// 			// si c'etait la derniere le joueur a gagne
		// 	}
		// }

		if (this.ball.lost(this.width, this.height)) {
			this.status = false;
			// api.post(game(temp de la game, gagnee ou perdue, nombre de coups de paddle pour les stats))
		}
		
		if (ball.flag)
			ball.move();

	}


	private renderBricks() {
			
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
		
		// bord paddle
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
