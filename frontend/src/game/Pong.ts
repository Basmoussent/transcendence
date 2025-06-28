export class Pong {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private paddle1: {
		width: number;
		height: number;
		x: number;
		y: number;
    speed: number;
	};

  private paddle2: {
		width: number;
		height: number;
		x: number;
		y: number;
    speed: number;
	};

  private ball: {
    size: number;
    x: number;
    y: number;
    speedx: number;
    speedy: number;
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

    this.paddle1 = {
			width: 20,
			height: 100,
			x: 0,
			y: 0,
      speed: 8
		};

    this.paddle2 = {
			width: 20,
			height: 100,
			x: 0,
			y: 0,
      speed: 8
		};

    this.ball = {
      size: 10,
      x: this.width / 2,
      y: this.height / 2,
      speedx: 8,
      speedy: -8
    };

		this.keys = {};
  }

  public init(): void {
		console.log('Initializing paddle game...');
    this.setupCanvas();
    this.setupEventListeners();
    this.startGameLoop();

    // on resize si la taille de la fenetre change
    window.addEventListener('resize', () => {
			this.setupCanvas();
		});
  }

  private setupCanvas(): void {
    console.log('Setting up canvas...');
		this.canvas.width = this.canvas.clientWidth || 800;
		this.canvas.height = this.canvas.clientHeight || 600;
		this.width = this.canvas.width;
		this.height = this.canvas.height;

    this.paddle1.x = 30;
		this.paddle1.y = (this.height - this.paddle1.height) / 2;

    this.paddle2.x = this.width - this.paddle2.width - 30;
    this.paddle2.y = (this.height - this.paddle1.height) / 2;

    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
  }

  // quand on appuie sur une touche this.keys[touche] = true
	private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  private startGameLoop(): void {
		console.log('Starting game loop...');
    // fleche au lieu de function() pour que this fasse ref a Pong
    const gameLoop = () => {
      this.update();
      this.render();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  private updatePaddle(paddle: typeof this.paddle1, upKey: string, downKey: string): void {
    // faire bouger le paddle
    if (this.keys[upKey])
        paddle.y -= paddle.speed;
    if (this.keys[downKey])
        paddle.y += paddle.speed;

    // ajuster au cas ou il sort des limites
    if (paddle.y < 0)
      paddle.y = 0;
    else if (paddle.y + paddle.height > this.height)
      paddle.y = this.height - paddle.height;
  }

  private update(): void {
    this.updatePaddle(this.paddle1, 'w', 's');
    this.updatePaddle(this.paddle2, 'arrowup', 'arrowdown');
  }

  private render(): void {
    // on efface tout
    this.ctx.clearRect(0, 0, this.width, this.height);

    // le fond
    this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);

    // les paddles
    this.ctx.fillStyle = '#4a90e2';
		this.ctx.fillRect(
			this.paddle1.x,
			this.paddle1.y,
			this.paddle1.width,
			this.paddle1.height
		);
    this.ctx.fillRect(
			this.paddle2.x,
			this.paddle2.y,
			this.paddle2.width,
			this.paddle2.height
		);

    // contours des 2 paddles
    this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(
			this.paddle1.x,
			this.paddle1.y,
			this.paddle1.width,
			this.paddle1.height
		);
    this.ctx.strokeRect(
			this.paddle2.x,
			this.paddle2.y,
			this.paddle2.width,
			this.paddle2.height
		);

    // la balle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.arc
  }
}