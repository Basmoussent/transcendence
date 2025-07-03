import { randomInt } from "./pongUtils";
import { Paddle } from "./pongUtils";

export class Pong {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private start: boolean;
  private end: boolean;

  private paddles: [Paddle, Paddle, (Paddle | null)?, (Paddle | null)?];

  private ball: {
    radius: number;
    x: number;
    y: number;
    speedx: number;
    speedy: number;
  };

  private power: {
    width: number,
    height: number,
    x: number,
    y: number,
    active: boolean,
    display: boolean,
    spawnTime: number
    collisionTime: number | null
  }

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

    // !!! modifier ca avec un this.paddles.push quand je pourrais get les infos de la partie
    this.paddles = [
      new Paddle(20, 100, 0, 0, 8),
      new Paddle(20, 100, 0, 0, 8),
      null,
      null
    ];

    this.ball = {
      radius: 10,
      x: this.width / 2,
      y: this.height / 2,
      speedx: 6,
      speedy: 0
    }

    this.power = {
      width: 20,
      height: 20,
      x: randomInt((this.width / 5) * 2, (this.width / 5) * 4),
      y: randomInt(0, this.height),
      active: false,
      display: false,
      spawnTime: Date.now() / 1000,
      collisionTime: null
    }

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

  private setUpPaddles(): void {
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
      this.paddles[2].y = this.height - this.paddles[2].height - 30;
      this.paddles[2].scorex = this.width / 2;
      this.paddles[2].scorey = this.height - 100;
    }

    if (this.paddles[3]) {
      this.paddles[3].x = this.width / 2 - this.paddles[3].width / 2;
      this.paddles[3].y = 30;
      this.paddles[3].scorex = this.width / 2;
      this.paddles[3].scorey = this.height - this.height + 100;
    }
  }

  private setupCanvas(): void {
    console.log('Setting up canvas...');
    this.canvas.width = this.canvas.clientWidth || 800;
    this.canvas.height = this.canvas.clientHeight || 600;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.setUpPaddles();

    // adjust ball size?
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;

    // this.power.width = this.paddles[0].width * 1.4;
    // this.power.height = this.power.width;
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

  private displayScore(): void{
    this.ctx.globalAlpha = 0.2;

    // ligne du milieu que si y'a 2 joueurs
    if (this.paddles[2] === null)
      this.drawLine();

    // faut faire un POST pour update score et etat de la partie
    for (let i = 0; i < 4; i++) {
      const paddle = this.paddles[i];
      if (paddle && paddle.winsGame() === true) {
        this.end = true;
        return ;
      }
    }

    // les scores
    for (let i = 0; i < 4; i++) {
      if (this.paddles[i] !== null)
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
        break ;
      }
    }
    this.ctx.fillText("WINS", this.width / 2 - 150, this.height / 2);

    this.ctx.globalAlpha = 1;
  }

  private updatePaddleUpDown(paddle: typeof this.paddles[0] | null, upKey: string, downKey: string): void {
    if (paddle === null)
      return ;

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
    this.ball.speedx *= -1;
    if (this.ball.speedx > 0 && this.ball.speedx < 12)
      this.ball.speedx += 0.25;
    else if (this.ball.speedx < 0 && this.ball.speedx > -12)
      this.ball.speedx -= 0.25;
  }

  private startPoint(): void {
    if (this.ball.x - this.ball.radius > this.width)
      this.paddles[0].score++;
    else
      this.paddles[1].score++;

    // replace la balle au centre
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;

    // celui qui gagne recoit la balle en premier
    this.ball.speedx *= -1;
    if (this.ball.speedy > 5)
      this.ball.speedy = 5;
    else if (this.ball.speedy < -5)
      this.ball.speedy = -5;

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

    // bord du paddle (20% en haut et en bas)
    const edgeZone = paddle.height * 0.2;

    if (hitY <= paddleTop + edgeZone) // touche le bord haut
      ball.speedy -= 4;
    else if (hitY >= paddleBottom - edgeZone) // touche le bord bas
      ball.speedy += 4;
    else if (hitY <= paddleCenter) // touche cote haut (mais pas bord)
      ball.speedy -= 2;
    else if (hitY > paddleCenter) // touche cote bas (mais pas bord)
      ball.speedy += 2;
  }

  private paddleCollision(): void {
    if (this.ball.x - this.ball.radius <= this.paddles[0].x + this.paddles[0].width && this.ball.y + this.ball.radius >= this.paddles[0].y && this.ball.y - this.ball.radius <= this.paddles[0].y + this.paddles[0].height && this.ball.x > this.paddles[0].x) {
      this.addBallSpeed();
      // this.adjustBallDir(this.ball, this.paddles[0]);
      this.ball.x = this.paddles[0].x + this.paddles[0].width + this.ball.radius;
      console.log('this.ball.speedx = ', this.ball.speedx);
    }
    if (this.ball.x + this.ball.radius >= this.paddles[1].x && this.ball.y + this.ball.radius >= this.paddles[1].y && this.ball.y - this.ball.radius <= this.paddles[1].y + this.paddles[1].height && this.ball.x < this.paddles[1].x + this.paddles[1].width) {
      this.addBallSpeed();
      // this.adjustBallDir(this.ball, this.paddles[1]);
      this.ball.x = this.paddles[1].x - this.ball.radius;
      console.log('this.ball.speedx = ', this.ball.speedx);
    }
  }

  private updateBall(ball: typeof this.ball): void {
    ball.x += ball.speedx;
    ball.y += ball.speedy;

    // check paddles collision + la balle prends en vitesse a chaque collision paddle + ajuster dir
    this.paddleCollision();

    // check wall collision - haut et bas
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= this.height)
      ball.speedy *= -1;

    // check scored point et relancer si oui
    if (ball.x - ball.radius > this.width || ball.x + ball.radius <= 0)
      this.startPoint();
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

  private drawPower(): void {
    this.ctx.fillStyle = '#ff0000';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.fillRect(
      this.power.x,
      this.power.y,
      this.power.width,
      this.power.height
    );
    this.ctx.strokeRect(
      this.power.x,
      this.power.y,
      this.power.width,
      this.power.height
    );
  }

  private powerCollision(ballx: number, bally: number, ballradius: number, powerx: number, powery: number, powerwidth: number, powerheight: number) {
    // Trouver le point du rectangle le plus proche du centre du cercle
    const closestX = Math.max(powerx, Math.min(ballx, powerx + powerwidth));
    const closestY = Math.max(powery, Math.min(bally, powery + powerheight));

    // Calculer la distance entre ce point et le centre du cercle
    const dx = ballx - closestX;
    const dy = bally - closestY;

    // Collision si distance^2 < rayon^2
    return (dx * dx + dy * dy) <= ballradius * ballradius;
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
