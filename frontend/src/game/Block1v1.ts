import { brick, createRandomBrick, fetchUsername } from "./blockUtils.ts"
import { getAuthToken } from '../utils/auth';

export class Block1v1 {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private bHeight: number;
	private bWidth: number;
	private status: boolean;
	private username: string;

	private paddle1: {
		width: number;
		height: number;
		x: number;
		y: number;
		speed: number;
	};

	private ball1: {
		radius: number;
		x: number;
		y: number;
		speedx: number;
		speedy: number;
		flag: boolean
	};

	private ball2: {
		radius: number;
		x: number;
		y: number;
		speedx: number;
		speedy: number;
		flag: boolean
	};

	private bricks: brick[] = [];

	private keys: { [key: string]: boolean };
  
	constructor(canvas: HTMLCanvasElement) {

		const token = getAuthToken();

		if (!token) {
			alert('❌ Token d\'authentification manquant'); }

		console.log(" token recu");

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


		this.paddle1 = {
			width: 100,
			height: 20,
			x: 0,
			y: 0,
			speed: 14
		};

		// this.width et this.height n'ont pas les bonnes mesures a ce moment la

		this.ball1 = {
			radius: 10,
			x: this.width / 2,
			y: this.height / 2, // update: mettre a hauteur de la derniere ligne de bricks
			speedx: 5,
			speedy: 5,
			flag: true
		};

		this.ball2 = {
			radius: 10,
			x: this.width / 2,
			y: this.height / 2, // update: mettre a hauteur de la premiere ligne de bricks
			speedx: 5,
			speedy: 5,
			flag: true
		};

		this.keys = {};
		this.bricks = [];
		this.loadUsername();

	}

	private brickId(x: number, y: number): number {
		var _x = Math.trunc((x * 20)/ this.width);
		var _y = Math.trunc((y * 20)/ this.height);

		if (_y != 0)
			--_y;

		if (_x >= 20 || _y >= 20 || ((20 * _y) + _x)) {
			console.error("brick undefined (", _x, ",", _y, ")\t", (20 * _y) + _x);
			throw new Error ("access brick");
		}

		return ((20 * _y) + _x);
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
		
		this.paddle1.x = (this.width - this.paddle1.width) / 2;
		this.paddle1.y = this.height - this.paddle1.height - 12; // 20 de base


		this.bWidth = this.width / 20;
		this.bHeight = this.height / 20;
		
		console.log('Canvas size:', this.width, this.height);
		console.log('Paddle position:', this.paddle1.x, this.paddle1.y);
	}
  
	private startGameLoop(): void {
		console.log('Starting game loop...');
		const gameLoop = () => {
			this.update(this.ball1);
			this.render();
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}

	private moveToHitPos(ball: typeof this.ball1): void {

		for (var i = 0; i < ball.speedx; ++i) {

			var id = this.brickId(ball.x + i, ball.y + i)

			if (!this.bricks[id])
				continue

			if (this.bricks[id].getHp()) {
				ball.x += i;
				ball.y += i;
				return;
			}
		}
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

	private update(ball: typeof this.ball1): void {

		if (this.keys['enter'] && !this.status) {
			if (this.bricks) {
				// this.logGame();
			}
			this.bricks = [];
			for (let it = 0; it < 80; ++it)
				this.bricks.push(createRandomBrick(it));
			this.status = true;
		}

		if (!this.status)
			return ;

		if (this.keys['a']) 
			this.paddle1.x -= this.paddle1.speed;
		if (this.keys['d'])
			this.paddle1.x += this.paddle1.speed;

		// mettre pause
		if (this.keys['p']) {
			if (this.ball1.flag)
				this.ball1.flag = false;
			else 
				this.ball1.flag = true;
		}

		// limits paddle
		if (this.paddle1.x < 0)
			this.paddle1.x = 0;
		else if (this.paddle1.x + this.paddle1.width > this.width)
			this.paddle1.x = this.width - this.paddle1.width;

		// collisions ball -> paddle
		if (ball.y + ball.radius + ball.speedy >= this.paddle1.y && ball.x + ball.radius + ball.speedx >= this.paddle1.x &&
			ball.x + ball.radius + ball.speedx <= this.paddle1.x + this.paddle1.width)
				ball.speedy *= -1;

		// collisions ball -> bricks
		if (ball.speedy < 0 && ball.y - ball.radius + ball.speedy <= this.height / 4) {

			try {
				var id = this.brickId(ball.x, ball.y)
				
				if (!this.bricks[id])
					console.error(id, " undefined dans bricks");
	
				
				if (this.bricks[id].getHp()) {
					this.moveToHitPos(this.ball1);
					this.bricks[id].beenHit();
					ball.speedy *= -1;
				}
			}
			catch (err) {
				console.log(err); }

		}

		if (ball.y - ball.radius + ball.speedy <= this.height / 4) {
	
			var id = this.brickId(this.ball1.x + this.ball1.speedx, ball.y + ball.radius + ball.speedy);
	
			// si le prochain x est different de l'actuel
			if (this.bricks[id].getHp()) {
				this.bricks[id].beenHit();
				this.ball1.speedx *= -1;
			}
		
		}



		// collisions gauche droite
		if (ball.x + ball.speedx <= 0 || ball.x + ball.speedx >= this.width)
			ball.speedx *= -1;

		// collisions haut
		if (ball.y + ball.speedy <= 0)
			ball.speedy *= -1;

		if (ball.y + ball.speedy >= this.height) {
			ball.radius = 10,
			ball.x = this.width / 2,
			ball.y = this.height / 2,
			console.log(this.width / 2, ",", this.height / 2);
			ball.speedx = 5,
			ball.speedy = 5
			
			this.status = false; // plus en partie
			// api.post(game(temp de la game, gagnee ou perdue, nombre de coups de paddle pour les stats))
		}
		
		if (ball.flag) {
			ball.x += ball.speedx;
			ball.y += ball.speedy;
		}

	}


	private renderBricks() {
		let	it = -1;

		for (const brick of this.bricks) {

			++it

			if (!brick.getHp())
				continue;

			let x = this.width / 20 * (it % 20);
			let y = this.height / 20 * Math.trunc(it / 20);

			this.ctx.fillStyle = brick.getColor();
			this.ctx.fillRect(x, y, this.bWidth, this.bHeight);
		}		
	}

	private drawBall(ball: typeof this.ball1): void {
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
			this.paddle1.x,
			this.paddle1.y,
			this.paddle1.width,
			this.paddle1.height
		);
		
		// bord paddle
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(
			this.paddle1.x,
			this.paddle1.y,
			this.paddle1.width,
			this.paddle1.height
		);
		this.renderBricks();
		this.drawBall(this.ball1);
		this.displayStartMsg(this.ctx);

	}

	
}
