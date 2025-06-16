export class Block {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private paddle: {
		width: number;
		height: number;
		x: number;
		y: number;
		speed: number;
	};
	private keys: { [key: string]: boolean };
  
	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2D context');
		}
		this.ctx = context;
		this.width = canvas.width;
		this.height = canvas.height;
		
		this.paddle = {
			width: 100,
			height: 20,
			x: 0,
			y: 0,
			speed: 8
		};

		this.keys = {};
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
		this.paddle.y = this.height - this.paddle.height - 30;
		
		console.log('Canvas size:', this.width, this.height);
		console.log('Paddle position:', this.paddle.x, this.paddle.y);
	}
  
	private startGameLoop(): void {
		console.log('Starting game loop...');
		const gameLoop = () => {
			this.update();
			this.render();
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}
  
	private update(): void {
		if (this.keys['a']) {
			this.paddle.x -= this.paddle.speed;
		}
		if (this.keys['d']) {
			this.paddle.x += this.paddle.speed;
		}

		if (this.paddle.x < 0) {
			this.paddle.x = 0;
		} else if (this.paddle.x + this.paddle.width > this.width) {
			this.paddle.x = this.width - this.paddle.width;
		}
	}
  
	private render(): void {
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		this.ctx.fillStyle = '#4a90e2';
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

		this.ctx.fillStyle = '#ffffff';
		this.ctx.font = '20px Arial';
		this.ctx.textAlign = 'center';
	}
}