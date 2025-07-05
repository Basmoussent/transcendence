import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Power } from "./power";
import { PADDLE_OFFSET } from "./const";

export class Pong {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private start: boolean;
  private end: boolean;
  private lastPlayerColl: number; // pour savoir qui va gagner le point

  private paddles: [Paddle, Paddle, (Paddle | null)?, (Paddle | null)?];

  private ball: Ball;

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
      new Paddle(20, 100, 0, 0, 8, false),
      new Paddle(20, 100, 0, 0, 8, true),
      null,
      null
    ];

    this.ball = new Ball(this.height, this.width);

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

  // positions et tailles de base en fonction de la taille du canvas
  private setupPaddles(): void {
    console.log('Setting up paddles...');
    this.paddles[0].x = PADDLE_OFFSET;
    this.paddles[0].y = (this.height - this.paddles[0].height) / 2;
    this.paddles[0].scorex = (this.width / 2) / 2;
    this.paddles[0].scorey = this.height / 2;

    this.paddles[1].x = this.width - this.paddles[1].width - PADDLE_OFFSET;
    this.paddles[1].y = (this.height - this.paddles[1].height) / 2;
    this.paddles[1].scorex = (this.width / 4) * 3;
    this.paddles[1].scorey = this.height / 2;

    const player3 = this.paddles[2];
    if (player3) {
      player3.x = this.width / 2 - player3.width / 2;
      player3.y = PADDLE_OFFSET;
      player3.scorex = this.width / 2;
      player3.scorey = this.height - this.height + 100;
    }

    const player4 = this.paddles[3];
    if (player4) {
      player4.x = this.width / 2 - player4.width / 2;
      player4.y = this.height - player4.height - PADDLE_OFFSET;
      player4.scorex = this.width / 2;
      player4.scorey = this.height - 100;
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
      if (paddle && paddle?.winsGame() === true) {
        this.end = true;
        return;
      }
    }

    // les scores
    for (let i = 0; i < 4; i++) {
      const paddle = this.paddles[i];
      if (paddle)
        paddle?.displayScore(this.ctx);
    }

    this.ctx.globalAlpha = 1;
  }

  private displayResult(): void {
    this.ctx.globalAlpha = 0.2;
    this.ctx.fillStyle = 'white';
    this.ctx.font = '48px sans-serif'; // changer police

    for (let i = 0; i < 4; i++) {
      const paddle = this.paddles[i];
      if (paddle && paddle?.winsGame() === true) {
        this.ctx.fillText(paddle.name, this.width / 2 - 70, this.height / 2);
        break;
      }
    }
    this.ctx.fillText("WINS", this.width / 2 - 70, this.height / 2 + 50);

    this.ctx.globalAlpha = 1;
  }

  private startPoint(): void {
    const paddle = this.paddles[this.lastPlayerColl];
    if (paddle)
      paddle.score++;

    // le point est rejoue si personne ne touche la balle
    this.lastPlayerColl = -1;

    this.ball.resetBallInfo(this.width, this.height);

    // !!! on annule les powers pour le nouveau point
  }

  private adjustBallDirMultiplayer(ball: typeof this.ball, paddle: typeof this.paddles[2] | typeof this.paddles[3] | null): void {
    if (!paddle)
      return ;

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
      this.ball.addBallSpeed();
      this.ball.speedx *= -1;
      this.ball.adjustBallDir(this.paddles[0]);
      this.ball.x = this.paddles[0].x + this.paddles[0].width + this.ball.radius;

      this.lastPlayerColl = 0;
    }
    if (this.ball.x + this.ball.radius >= this.paddles[1].x && this.ball.y + this.ball.radius >= this.paddles[1].y && this.ball.y - this.ball.radius <= this.paddles[1].y + this.paddles[1].height && this.ball.x < this.paddles[1].x + this.paddles[1].width) {
      this.ball.addBallSpeed();
      this.ball.speedx *= -1;
      this.ball.adjustBallDir(this.paddles[1]);
      this.ball.x = this.paddles[1].x - this.ball.radius;

      this.lastPlayerColl = 1;
    }
  }

  private ballMultiplayerCollision(): void {
    const player3 = this.paddles[2]; // haut

    if (player3 &&
      this.ball.y - this.ball.radius <= player3.y + player3.height &&
      this.ball.x + this.ball.radius >= player3.x &&
      this.ball.x - this.ball.radius <= player3.x + player3.width &&
      this.ball.y > player3.y) {
        this.ball.addBallSpeed();
        this.ball.speedy *= -1;
        this.adjustBallDirMultiplayer(this.ball, player3);
        
        // repositionner balle pour eviter comportement bizarre
        this.ball.y = player3.y + player3.height + this.ball.radius + 0.1;
        
        this.ball.speedy = Math.abs(this.ball.speedy);

        this.lastPlayerColl = 2;
    }

    const player4 = this.paddles[3]; // bas

    if (player4 &&
      this.ball.y + this.ball.radius >= player4.y &&
      this.ball.x + this.ball.radius >= player4.x &&
      this.ball.x - this.ball.radius <= player4.x + player4.width &&
      this.ball.y < player4.y + player4.height) {
        this.ball.addBallSpeed();
        this.ball.speedy *= -1;
        this.adjustBallDirMultiplayer(this.ball, player4);

        // repositionner balle pour eviter comportement bizarre
        this.ball.y = player4.y - this.ball.radius - 0.1;

        this.ball.speedy = -Math.abs(this.ball.speedy);

        this.lastPlayerColl = 3;
    }
  }

  private updateBall(ball: typeof this.ball): void {
    const player3 = this.paddles[2];
    const player4 = this.paddles[3];

    ball.x += ball.speedx;
    ball.y += ball.speedy;

    // check paddles collision + la balle prends en vitesse a chaque collision paddle + ajuster dir
    this.ballPaddleCollision();
    if (player3)
      this.ballMultiplayerCollision();

    // check scored point et relancer si oui
    if (ball.x - ball.radius > this.width || ball.x + ball.radius <= 0 || (player3 && ball.y - ball.radius <= 0) || (player4 && ball.y + ball.radius >= this.height))
      this.startPoint();

    // check wall collision haut
    if (!player3 && ball.y - ball.radius <= 0)
      ball.speedy *= -1;

    // check wall collision bas
    if (!player4 && ball.y + ball.radius >= this.height)
      ball.speedy *= -1;
  }

  private update(): void {
    this.paddles[0].updatePaddleRightLeft(this.keys, 'w', 's', this.paddles, this.height);

    if (this.paddles[1].ai)
      this.paddles[1].updateAIRightLeft(this.ball, this.paddles, this.height);
    else
      this.paddles[1].updatePaddleRightLeft(this.keys, 'arrowup', 'arrowdown', this.paddles, this.height);

    const player3 = this.paddles[2];
    if (player3)
      player3?.updatePaddleUpDown(this.keys, 'k', 'l', this.paddles, this.width);

    const player4 = this.paddles[3];
    if (player4)
      player4?.updatePaddleUpDown(this.keys, '5', '6', this.paddles, this.width);

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
