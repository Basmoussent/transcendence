import { brick, Ball, Paddle, createRandomBrick, fetchUsername } from "./blockUtils.ts"

export class Block1v1 {

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private winner: string;
	private status: boolean;
	private username: string;

	private ball1: Ball;
	private ball2: Ball;
	private paddle1: Paddle;
	private paddle2: Paddle;
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
		this.bHeight = 0;
		this.bWidth = 0;
		this.username = "ko";

		this.paddle1 = new Paddle(0, 0, 14);
		this.ball1 = new Ball(this.width / 2, (this.height / 5) * 3); // spawn a la ligne basse des bricks

		this.paddle2 = new Paddle(0, 0, 14);
		this.ball2 = new Ball(this.width / 2, (this.height / 5) * 2); // spawn a la ligne haute des bricks

		this.keys = {};
		this.bricks = [];
		for (let it = 0; it < 100; ++it)
			this.bricks.push(createRandomBrick(it));
		// this.loadUsername();

	}


	public init(): void {

		console.log('Initializing block 1v1 game...');

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
		
		this.paddle1.x = (this.width - this.paddle1.width) / 2;
		this.paddle1.y = this.height - this.paddle1.height - 12;

		this.paddle2.x = (this.width - this.paddle2.width) / 2;
		this.paddle2.y = this.paddle2.height - 12 + 1;

		console.log('Canvas size:', this.width, this.height);
		console.log('Paddle1 position:', this.paddle1.x, this.paddle1.y);
		console.log('Paddle2 position:', this.paddle2.x, this.paddle2.y);
	}
  
	private startGameLoop(): void {
		console.log('Starting game loop...');
		const gameLoop = () => {
			this.update(this.ball1, this.ball2);
			this.render();
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}

	private update(ball1: Ball, ball2: Ball): void {

		if (this.keys['enter'] && !this.status) {
			// this.bricks = [];
			// for (let it = 0; it < 100; ++it)
			// 	this.bricks.push(createRandomBrick(it));
			ball1.reset(this.width / 2, (this.height / 5) * 3, -2, 3)
			ball2.reset(this.width / 2, (this.height / 5) * 2, 2, -3)
			this.status = true;
		}

		if (!this.status)
			return ;

		if (this.keys['a']) 
			this.paddle1.move("left", this.width)
		if (this.keys['d'])
			this.paddle1.move("right", this.width)

		if (this.keys['arrowleft']) 
			this.paddle2.move("left", this.width)
		if (this.keys['arrowright'])
			this.paddle2.move("right", this.width)

		ball1.collisionPadd1(this.paddle1);
		ball1.collisionPadd2(this.paddle2);

		ball2.collisionPadd1(this.paddle1);
		ball2.collisionPadd2(this.paddle2);

		if (ball1.y >= (this.height / 5) * 2 && ball1.y <= (this.height / 5) * 3) {

			let row = Math.floor((ball1.y - (this.height / 5) * 2) / (this.height / 5 ) * 5);
			let index = Math.floor(ball1.x / (this.width) * 20);

			if (row > 4)
				row = 4;

			console.log("row - index, ", row, " ", index);

			if (this.bricks[(row * 20) + index].getHp()) {

				this.bricks[(row * 20) + index].beenHit();
				ball1.speedy *= -1;
			}
		}

		if (ball2.y >= (this.height / 5) * 2 && ball2.y <= (this.height / 5) * 3) {

			let row = Math.floor((ball2.y - (this.height / 5) * 2) / (this.height / 5 ) * 5);
			let index = Math.floor(ball2.x / (this.width) * 20);

			if (row > 4)
				row = 4;

			console.log("row - index, ", row, " ", index);

			if (this.bricks[(row * 20) + index].getHp()) {

				this.bricks[(row * 20) + index].beenHit();
				ball2.speedy *= -1;
			}
		}


		if (this.lost1v1(this.height, ball1, ball2)) {
			this.status = false;
			// api.post(game(temp de la game, gagnee ou perdue, nombre de coups de paddle pour les stats))
		}

		ball1.move();
		ball2.move();

		// console.log(`Ball 1 - x: ${ball1.x}, y: ${ball1.y}`);
		// console.log(`Ball 2 - x: ${ball2.x}, y: ${ball2.y}`);

	}

	private drawBall(ball: Ball): void {
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

	private displayStartMsg(ctx: typeof this.ctx): void {
		if (this.status)
			return;
		ctx.globalAlpha = 0.2;
		ctx.fillStyle = 'white';
		ctx.font = '48px sans-serif'; // changer police
		ctx.fillText('PRESS ENTER', this.width / 2 - 150, (this.height / 4) * 3);
		ctx.fillText('TO START', this.width / 2 - 100, (this.height / 4) * 3 + 60);
		ctx.globalAlpha = 1;
	}

	private renderBricks() {

		for (var row = 0; row < 5; ++row) {
			for (var index = 0; index < 20; ++index) {
				if (!this.bricks[(row * 20) + index].getHp())
					continue ;
				this.bricks[(row * 20) + index].getColor();
				this.ctx.fillStyle = this.bricks[(row * 20) + index].getColor();
				this.ctx.fillRect(Math.round(this.width / 20 * index), Math.round((this.height / 20 * row) + (this.height / 5) * 2), Math.round(this.width / 20), Math.round(this.height / 20));
			}
		}
	}

	public lost1v1(height:number, ball1:Ball, ball2:Ball): boolean {

		if (ball1.y + ball1.radius <= 0 || ball2.y + ball2.radius <= 0) {
			this.winner = "joueur 1";
			console.log("joueur 1 a gagne");
			return true;
		}
		else if (ball1.y + ball1.radius >= height || ball2.y + ball2.radius >= height) {
			this.winner = "joueur 2";
			console.log("joueur 2 a gagne");
			return true;
		}
		return false;
	}

	private render(): void {
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		// fenetre de jeu
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		// paddle
		this.ctx.fillStyle = '#84AD8A';
		this.ctx.fillRect(
			this.paddle1.x,
			this.paddle1.y,
			this.paddle1.width,
			this.paddle1.height
		);
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(
			this.paddle1.x,
			this.paddle1.y,
			this.paddle1.width,
			this.paddle1.height
		);

		this.ctx.fillStyle = '#84A6AD';
		this.ctx.fillRect(
			this.paddle2.x,
			this.paddle2.y,
			this.paddle2.width,
			this.paddle2.height
		);
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(
			this.paddle2.x,
			this.paddle2.y,
			this.paddle2.width,
			this.paddle2.height
		);
		
		this.renderBricks();
		this.drawBall(this.ball1);
		this.drawBall(this.ball2);
		this.displayStartMsg(this.ctx);

	}




}
