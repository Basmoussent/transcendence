import { PADDLE_OFFSET } from "./const";
import { PaddleAI } from "./paddle-ai";
import { t } from '../../utils/translations';

export class Paddle {
    name: string;
    width: number;
    height: number;
    x: number;
    y: number;
    speed: number;
    score: number;
    color: string;

    constructor(width: number, height: number, color: string) {
        this.name = t('pong.player');
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.speed = 9;
        this.score = 0;
        this.color = color;
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
        return this.score === 3;
    }

    displayScore(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = this.color;
        ctx.font = '48px gaming';
        ctx.fillText(this.score.toString(), x, y);
    }

    drawPaddle(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
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
    
    updatePaddleUpDown(keys: { [key: string]: boolean }, upKey: string, downKey: string, paddles: [Paddle, Paddle | PaddleAI], canvasWidth: number): void {

        if (keys[downKey])
            this.checkAndMoveRight(paddles[1], canvasWidth);

        if (keys[upKey])
            this.checkAndMoveLeft(paddles[0]);
    }

    updatePaddleRightLeft(keys: { [key: string]: boolean }, upKey: string, downKey: string, canvasHeight: number): void {
        if (keys[upKey])
            this.moveUp();

        if (keys[downKey])
            this.moveDown(canvasHeight);
    }
}