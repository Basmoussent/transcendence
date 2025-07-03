import { Paddle } from "./pongUtils";

export class Pong {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private start: boolean;
  private end: boolean;
  private lastPlayerColl: number;

  private paddles: [Paddle, Paddle, (Paddle | null)?, (Paddle | null)?];
  // private power: Power;

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
    this.start = false;
    this.end = false;
    this.lastPlayerColl = -1;

    // !!! modifier ca avec les infos de la partie
    this.paddles = [
      new Paddle(20, 100, 0, 0, 8),
      new Paddle(20, 100, 0, 0, 8),
      new Paddle(100, 20, 0, 0, 8),
      null
    ];

    this.ball = {
      radius: 10,
      x: this.width / 2,
      y: this.height / 2,
      speedx: 6,
      speedy: 0
    }

    // this.power = new Power(this.width, this.height);
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

  private setupPaddles(): void {
    this.paddles[0].x = 30;
    this.paddles[0].y = (this.height - this.paddles[0].height) / 2;
    this.paddles[0].scorex = (this.width / 2) / 2;
    this.paddles[0].scorey = this.height / 2;

    this.paddles[1].x = this.width - this.paddles[1].width - 30;
    this.paddles[1].y = (this.height - this.paddles[1].height) / 2;
    this.paddles[1].scorex = (this.width / 4) * 3;
    this.paddles[1].scorey = this.height / 2;

    if (this.paddles[2]) {
      this.paddles[2].x = this.width / 2 - this.paddles[2].width / 2;
      this.paddles[2].y = 30;
      this.paddles[2].scorex = this.width / 2;
      this.paddles[2].scorey = this.height - this.height + 100;
    }

    if (this.paddles[3]) {
      this.paddles[3].x = this.width / 2 - this.paddles[3].width / 2;
      this.paddles[3].y = this.height - this.paddles[3].height - 30;
      this.paddles[3].scorex = this.width / 2;
      this.paddles[3].scorey = this.height - 100;
    }
  }

  private setupCanvas(): void {
    console.log('Setting up canvas...');
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

    // recup les infos des joueurs
    // nbr de joueurs
    // s'il y a une ou plusieurs IA dans la partie

    // fleche au lieu de function() pour que this fasse ref a Pong
    const gameLoop = () => {
      if (this.keys['enter'])
        this.start = true;
      if (this.start && !this.end)
        this.update();
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
    this.ctx.beginPath();
    this.ctx.moveTo(this.width / 2, 30);
    this.ctx.lineTo(this.width / 2, this.height - 30);
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private displayScore(): void {
    this.ctx.globalAlpha = 0.2;

    // ligne du milieu que si y'a 2 joueurs
    if (this.paddles[2] === null)
      this.drawLine();

    // faut faire un POST pour update score et etat de la partie
    for (let i = 0; i < 4; i++) {
      const paddle = this.paddles[i];
      if (paddle && paddle.winsGame() === true) {
        this.end = true;
        return;
      }
    }

    // les scores
    for (let i = 0; i < 4; i++) {
      if (this.paddles[i])
        this.paddles[i]?.displayScore(this.ctx);
    }

    this.ctx.globalAlpha = 1;
  }

  private displayResult(): void {
    this.ctx.globalAlpha = 0.2;
    this.ctx.fillStyle = 'white';
    this.ctx.font = '48px sans-serif'; // changer police

    for (let i = 0; i < 4; i++) {
      const paddle = this.paddles[i];
      if (paddle && paddle.winsGame() === true) {
        this.ctx.fillText(paddle.name, this.width / 2 - 150, this.height / 2);
        break;
      }
    }
    this.ctx.fillText("WINS", this.width / 2 - 150, this.height / 2 - 150);

    this.ctx.globalAlpha = 1;
  }

  private updatePaddleUpDown(paddle: typeof this.paddles[0] | null, upKey: string, downKey: string): void {
    if (paddle === null)
      return;

    // faire bouger le paddle
    else if (this.keys[downKey])
      paddle.moveRight(this.width);
    else if (this.keys[upKey])
      paddle.moveLeft();

    // !!! paddle collision
    // peut collide avec this.paddles[0] et this.paddles[1]
  }

  private updatePaddleRightLeft(paddle: typeof this.paddles[0], upKey: string, downKey: string): void {
    if (this.keys[upKey])
      paddle.moveUp();
    if (this.keys[downKey])
      paddle.moveDown(this.height);

    // !!! paddle collision
    // peut collide avec this.paddles[3] et this.paddles[4]
  }

  private addBallSpeed(): void {
    if (this.ball.speedx > 0 && this.ball.speedx < 12)
      this.ball.speedx += 0.25;
    else if (this.ball.speedx < 0 && this.ball.speedx > -12)
      this.ball.speedx -= 0.25;
  }

  private startPoint(): void {
    const paddle = this.paddles[this.lastPlayerColl];
    if (paddle)
      paddle.score++;

    // le point est rejoue si personne ne touche la balle
    this.lastPlayerColl = -1;

    // replace la balle au centre
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;

    // celui qui gagne recoit la balle en premier
    this.ball.speedx *= -1;
    this.ball.speedy = 1;

    // on reset a la vitesse de base
    if (this.ball.speedx > 0)
      this.ball.speedx = 6;
    else
      this.ball.speedx = -6;

    // on annule les powers pour le nouveau point
    this.paddles[0].height = 100;
    this.paddles[1].height = 100;
  }

  private adjustBallDir(ball: typeof this.ball, paddle: typeof this.paddles[0] | typeof this.paddles[1]): void {
    const hitY = ball.y;

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleCenter = paddle.y + paddle.height / 2;

    const edgeZone = paddle.height * 0.2;

    if (hitY <= paddleTop + edgeZone) // touche le bord haut
      ball.speedy -= 3;
    else if (hitY >= paddleBottom - edgeZone) // touche le bord bas
      ball.speedy += 3;
    else if (hitY <= paddleCenter) // touche cote haut (mais pas bord)
      ball.speedy -= 1;
    else if (hitY > paddleCenter) // touche cote bas (mais pas bord)
      ball.speedy += 1;
  }

  private adjustBallDirMultiplayer(ball: typeof this.ball, paddle: typeof this.paddles[0]): void {
    const hitX = ball.x;

    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleCenter = paddle.x + paddle.width / 2;

    const edgeZone = paddle.width * 0.2;

    if (hitX <= paddleLeft + edgeZone) // touche bord gauche
      ball.speedx -= 3;
    else if (hitX >= paddleRight - edgeZone) // touche bord droit
      ball.speedx += 3;
    else if (hitX <= paddleCenter) // touche côté gauche (mais pas bord)
      ball.speedx -= 1;
    else if (hitX > paddleCenter) // touche côté droit (mais pas bord)
      ball.speedx += 1;
  }

  private ballPaddleCollision(): void {
    if (this.ball.x - this.ball.radius <= this.paddles[0].x + this.paddles[0].width && this.ball.y + this.ball.radius >= this.paddles[0].y && this.ball.y - this.ball.radius <= this.paddles[0].y + this.paddles[0].height && this.ball.x > this.paddles[0].x) {
      this.addBallSpeed();
      this.ball.speedx *= -1;
      this.adjustBallDir(this.ball, this.paddles[0]);
      this.ball.x = this.paddles[0].x + this.paddles[0].width + this.ball.radius;

      this.lastPlayerColl = 0;
    }
    if (this.ball.x + this.ball.radius >= this.paddles[1].x && this.ball.y + this.ball.radius >= this.paddles[1].y && this.ball.y - this.ball.radius <= this.paddles[1].y + this.paddles[1].height && this.ball.x < this.paddles[1].x + this.paddles[1].width) {
      this.addBallSpeed();
      this.ball.speedx *= -1;
      this.adjustBallDir(this.ball, this.paddles[1]);
      this.ball.x = this.paddles[1].x - this.ball.radius;

      this.lastPlayerColl = 1;
    }
  }

  private ballMultiplayerCollision(): void {
    const player3 = this.paddles[2];
    // Paddle en haut (index 2)
    if (player3 &&
      this.ball.y - this.ball.radius <= player3.y + player3.height &&
      this.ball.x + this.ball.radius >= player3.x &&
      this.ball.x - this.ball.radius <= player3.x + player3.width &&
      this.ball.y > player3.y
    ) {
      this.addBallSpeed();
      this.ball.speedy *= -1;
      this.adjustBallDirMultiplayer(this.ball, player3);
      
      // Repositionner la balle juste en dessous du paddle (avec une marge)
      this.ball.y = player3.y + player3.height + this.ball.radius + 0.1;
      
      // Inverser la vitesse verticale (rebond)
      this.ball.speedy = Math.abs(this.ball.speedy);

      this.lastPlayerColl = 2;
    }

    const player4 = this.paddles[3];
    // Paddle en bas (index 3)
    if (player4 &&
      this.ball.y + this.ball.radius >= player4.y &&
      this.ball.x + this.ball.radius >= player4.x &&
      this.ball.x - this.ball.radius <= player4.x + player4.width &&
      this.ball.y < player4.y + player4.height
    ) {
      this.addBallSpeed();
      this.ball.speedy *= -1;
      this.adjustBallDirMultiplayer(this.ball, player4);

      // Repositionner la balle juste au-dessus du paddle (avec une marge)
      this.ball.y = player4.y - this.ball.radius - 0.1;

      // Inverser la vitesse verticale (rebond)
      this.ball.speedy = -Math.abs(this.ball.speedy);

      this.lastPlayerColl = 3;
    }
  }


  private updateBall(ball: typeof this.ball): void {
    ball.x += ball.speedx;
    ball.y += ball.speedy;

    // check paddles collision + la balle prends en vitesse a chaque collision paddle + ajuster dir
    this.ballPaddleCollision();
    this.ballMultiplayerCollision();

    // check scored point et relancer si oui
    if (ball.x - ball.radius > this.width || ball.x + ball.radius <= 0 || (ball.y - ball.radius <= 0 && this.paddles[2]) || (ball.y + ball.radius >= this.height && this.paddles[3]))
      this.startPoint();

    // check wall collision haut
    if (ball.y - ball.radius <= 0 && this.paddles[2] === null)
      ball.speedy *= -1;

    // check wall collision bas
    if (ball.y + ball.radius >= this.height && this.paddles[3] === null)
      ball.speedy *= -1;
  }

  private update(): void {
    this.updatePaddleRightLeft(this.paddles[0], 'w', 's');
    this.updatePaddleRightLeft(this.paddles[1], 'arrowup', 'arrowdown');

    if (this.paddles[2])
      this.updatePaddleUpDown(this.paddles[2], 'k', 'l');
    if (this.paddles[3])
      this.updatePaddleUpDown(this.paddles[3], '5', '6');

    this.updateBall(this.ball);
  }

  private drawBall(ctx: typeof this.ctx, x: number, y: number, size: number): void {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }

  private render(): void {
    // on efface tout
    this.ctx.clearRect(0, 0, this.width, this.height);

    // le fond
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // les paddles + leur contour
    for (let i = 0; i < this.paddles.length; i++)
      this.paddles[i]?.drawPaddle(this.ctx);

    if (this.start && !this.end) {

      this.drawBall(this.ctx, this.ball.x, this.ball.y, this.ball.radius);
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
