import { PADDLE_OFFSET } from "./const";
import { Paddle } from "./paddle";
import { Ball } from "./ball";

export class PaddleAI {
    name: string;
    width: number;
    height: number;
    x: number;
    y: number;
    speed: number;
    score: number;
    scorex: number;
    scorey: number;

    // ai
    lastRefresh: number | null;
    up: boolean;
    down: boolean;
    targetY: number;
    mode: number; // easy = 0 / middle = 1 / hard = 2

    constructor(width: number, height: number, x: number, y: number, speed: number, mode: number) {
        this.name = "Player";
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.score = 0;
        this.scorex = 0;
        this.scorey = 0;

        // ia
        this.lastRefresh = null;
        this.up = false;
        this.down = false;
        this.targetY = 0;
        this.mode = mode;
    }

    moveUp(): void {
        this.y -= this.speed;
        if (this.y < 0)
            this.y = 0;
    }

    moveLeft(): void {
        this.x -= this.speed;
        if (this.x < 0)
            this.x = 0;
    }

    moveRight(canvasWidth: number): void {
        this.x += this.speed;
        if (this.x + this.width > canvasWidth)
            this.x = canvasWidth - this.width;
    }

    moveDown(canvasHeight: number): void {
        this.y += this.speed;
        if (this.y + this.height > canvasHeight)
            this.y = canvasHeight - this.height;
    }

    winsGame(): boolean {
        return this.score === 5;
    }

    displayScore(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif'; // changer police
        ctx.fillText(this.score.toString(), this.scorex, this.scorey);
    }

    drawPaddle(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(
        this.x,
        this.y,
        this.width,
        this.height
        );

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
        this.x,
        this.y,
        this.width,
        this.height
        );
    }

    private checkAndMoveRight(player2: Paddle | PaddleAI, canvasWidth: number): void {
      let canMove = true;
      const verticalOverlap = this.y < player2.y + player2.height && this.y + this.height > player2.y;
      const horizontalCollision = this.x + this.width >= player2.x - PADDLE_OFFSET;

      if (verticalOverlap && horizontalCollision)
          canMove = false;

      if (canMove)
          this.moveRight(canvasWidth);
      else
          this.x = canvasWidth - PADDLE_OFFSET - this.width - player2.width;
    }

    private checkAndMoveLeft(player1: Paddle): void {
      let canMove = true;
      const verticalOverlap = this.y < player1.y + player1.height && this.y + this.height > player1.y;
      const horizontalCollision = this.x <= player1.x + player1.width + PADDLE_OFFSET;

      if (verticalOverlap && horizontalCollision)
          canMove = false;

      if (canMove)
          this.moveLeft();
      else
          this.x = PADDLE_OFFSET + player1.width;
    }

    updatePaddleUpDown(keys: { [key: string]: boolean }, upKey: string, downKey: string, paddles: [Paddle, Paddle | PaddleAI, (Paddle | PaddleAI | null)?, (Paddle | PaddleAI | null)?], canvasWidth: number): void {

        if (keys[downKey])
          this.checkAndMoveRight(paddles[1], canvasWidth);

        if (keys[upKey])
          this.checkAndMoveLeft(paddles[0]);
    }

    private   checkAndMoveUp(player3: Paddle | PaddleAI | null | undefined): void {

      let canMove = true;
      if (player3) {
      const horizontalOverlap = this.x < player3.x + player3.width && this.x + this.width > player3.x;
      const verticalCollision = this.y <= player3.y + player3.height + PADDLE_OFFSET;

      if (horizontalOverlap && verticalCollision)
          canMove = false;
      }
      if (canMove)
      this.moveUp();
      else if (player3)
      this.y = PADDLE_OFFSET + player3.height; // eviter collision avec player3
    }

    private   checkAndMoveDown(player4: Paddle | PaddleAI | null | undefined, canvasHeight: number): void {

      let canMove = true;
        if (player4) {
          const horizontalOverlap = this.x < player4.x + player4.width && this.x + this.width > player4.x;
          const verticalCollision = this.y + this.height >= player4.y - PADDLE_OFFSET;

          if (horizontalOverlap && verticalCollision)
            canMove = false;
        }
        if (canMove)
          this.moveDown(canvasHeight);
        else if (player4)
          this.y = canvasHeight - PADDLE_OFFSET - player4.height - this.height; // eviter collision avec player4
    }

    private canRefresh(): boolean {
      return this.lastRefresh === null || Date.now() / 1000 - this.lastRefresh >= 1;
    }

	// ne predit rien, essaye juste de suivre la balle
    easyRightLeft(ball: Ball, paddles: [Paddle, Paddle | PaddleAI, (Paddle | PaddleAI | null)?, (Paddle | PaddleAI | null)?], canvasHeight: number): void {
      if (this.up && this.y > this.targetY)
          this.checkAndMoveUp(paddles[2]);
      else if (this.down && this.y < this.targetY)
          this.checkAndMoveDown(paddles[3], canvasHeight);
      
      // the AI can only refresh its view of the game once per second
      if (this.canRefresh()) {
          if (ball.y < this.y) {
              this.down = false;
              this.up = true;
              this.targetY = ball.y;
          }
          else if (ball.y > this.y) {
              this.up = false;
              this.down = true;
              this.targetY = ball.y;
          }
          else if (ball.y == this.y) {
              this.up = false;
              this.down = false;
			  this.targetY = this.height / 2;
          }
          this.lastRefresh = Date.now() / 1000;
      }
    }

	// utilise les coordonnees de la balle et sa vitesse pour calculer targetY (chaque seconde)
	middleRightLeft(ball: Ball, paddles: [Paddle, Paddle | PaddleAI, (Paddle | PaddleAI | null)?, (Paddle | PaddleAI | null)?], canvasHeight: number): void {
		if (this.up && this.y > this.targetY)
			this.checkAndMoveUp(paddles[2]);
		else if (this.down && this.y < this.targetY)
			this.checkAndMoveDown(paddles[3], canvasHeight);
		
		// the AI can only refresh its view of the game once per second
		if (this.canRefresh()) {
			const timeToImpact = (this.x - ball.x) / ball.speedX;
			this.targetY = ball.y + ball.speedY * timeToImpact;

			// si la balle est pas en train de venir vers nous on se replace au milieu
			if (ball.speedX < 0) {
				this.targetY = (canvasHeight - this.height) / 2;
				this.up = false;
				this.down = false;
			}
			if (this.y > this.targetY) {
				this.up = true;
				this.down = false;
			}
			else if (this.y < this.targetY) {
				this.up = false;
				this.down = true;
			}
			this.lastRefresh = Date.now() / 1000;
		}
    }

	// au moment de la collision paddle, calcule tous les prochains mouvements/rebonds de la balle jusqu'au point d'impact
	// l'ia a acces au resultat du calcul 1 fois par sec, faudra peut etre reduire sa speed pour compenser ou autre
	hardRightLeft(ball: Ball, paddles: [Paddle, Paddle | PaddleAI, (Paddle | PaddleAI | null)?, (Paddle | PaddleAI | null)?], canvasHeight: number): void {
		if (this.up && this.y > this.targetY)
			this.checkAndMoveUp(paddles[2]);
		else if (this.down && this.y < this.targetY)
			this.checkAndMoveDown(paddles[3], canvasHeight);
		
		// the AI can only refresh its view of the game once per second
		if (this.canRefresh()) {
			// calculer targetY et se diriger vers lui 
			// else if la dir de la balle est pas vers nous alors on met les deux a false
			this.lastRefresh = Date.now() / 1000;
		}
	}
}
