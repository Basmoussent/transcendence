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
    radius: number;
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
      radius: 10,
      x: this.width / 2,
      y: this.height / 2,
      speedx: -5,
      speedy: -5
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

    // ajouter adjust ball size?
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

  private updateBall(ball: typeof this.ball, paddle1: typeof this.paddle1, paddle2: typeof this.paddle2): void {
    ball.x += ball.speedx;
    ball.y += ball.speedy;

    // modif par rapport a ou ca touche le paddle
    // check paddles collision
    // if (ball.x - ball.radius <= paddle1.x + paddle1.width && ball.y + ball.radius >= paddle1.y && ball.y - ball.radius <= paddle1.y + paddle1.height)
    // {
    //   ball.speedx *= -1;
    //   ball.x = paddle1.x + paddle1.width + ball.radius;
    // }

    // if (ball.x + ball.radius >= paddle2.x && ball.y + ball.radius >= paddle2.y && ball.y - ball.radius <= paddle2.y + paddle2.height)
    // {
    //   ball.speedx *= -1;
    //   ball.x = paddle2.x - ball.radius;
    // }

    // check wall collision - haut et bas
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= this.height)
      ball.speedy *= -1;

    // check scored point et relancer si oui
    if (ball.x - ball.radius > this.width || ball.x + ball.radius <= 0)
    {
      // add point to player
      ball.x = this.width / 2;
      ball.y = this.height / 2;
      ball.speedx *= -1;
    }
  }

  private update(): void {
    this.updatePaddle(this.paddle1, 'w', 's');
    this.updatePaddle(this.paddle2, 'arrowup', 'arrowdown');
    this.updateBall(this.ball, this.paddle1, this.paddle2);
  }

  private drawBall(ctx: typeof this.ctx, x: number, y: number, size: number): void {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }

  private drawPaddles(ctx: typeof this.ctx, paddle1: typeof this.paddle1, paddle2: typeof this.paddle2): void {
    // paddles
    ctx.fillStyle = '#4a90e2';
		ctx.fillRect(
			paddle1.x,
			paddle1.y,
			paddle1.width,
			paddle1.height
		);
    ctx.fillRect(
			paddle2.x,
			paddle2.y,
			paddle2.width,
			paddle2.height
		);

    // contours
    ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.strokeRect(
			paddle1.x,
			paddle1.y,
			paddle1.width,
			paddle1.height
		);
    ctx.strokeRect(
			paddle2.x,
			paddle2.y,
			paddle2.width,
			paddle2.height
		);
  }

  private render(): void {
    // on efface tout
    this.ctx.clearRect(0, 0, this.width, this.height);

    // le fond
    this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);

    // les paddles + leur contour
    this.drawPaddles(this.ctx, this.paddle1, this.paddle2);

    // la balle
    this.drawBall(this.ctx, this.ball.x, this.ball.y, this.ball.radius);
  }
}