import { BALL_BASE_SPEED } from "./const";
import { Paddle } from "./paddle";
import { PaddleAI } from "./paddle-ai";

export class Ball {
  radius: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;

  constructor(canvasHeight: number, canvasWidth: number) {
    this.radius = 10;
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedX = BALL_BASE_SPEED;
    this.speedY = 0;
  }

  drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }

  addBallSpeed(): void {
    if (this.speedX > 0 && this.speedX < 12)
      this.speedX += 0.20;
    else if (this.speedX < 0 && this.speedX > -12)
      this.speedX -= 0.20;
  }

  addBallSpeedMulti(): void {
    if (this.speedY > 0 && this.speedY < 12)
					this.speedY += 0.20;
    else if (this.speedY < 0 && this.speedY > -12)
      this.speedY -= 0.20;
  }

  adjustBallDir(paddle: Paddle | PaddleAI, nbrOfPlayers: number): void {
    const hitY = this.y;

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleCenter = paddle.y + paddle.height / 2;
    const edgeZone = paddle.height * 0.2;

    const multiplier = nbrOfPlayers > 2 ? 1.5 : 1;

    if (hitY <= paddleTop + edgeZone) // bord haut
      this.speedY -= 3 * multiplier;
    else if (hitY >= paddleBottom - edgeZone) // bord bas
      this.speedY += 3 * multiplier;
    else if (hitY <= paddleCenter) // cote haut
      this.speedY -= 1 * multiplier;
    else if (hitY > paddleCenter) // cote bas
      this.speedY += 1 * multiplier;
  }

  resetBallInfo(canvasWidth: number, canvasHeight: number, lastWinner: number): void {
    // replace la balle au centre
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    
    // celui qui gagne reçoit la balle en premier
    if (lastWinner !== -1)
    {
        switch (lastWinner) {
            case 0: // gauche
                this.speedX = -BALL_BASE_SPEED;
                this.speedY = 0;
                break;
            case 1: // droite
                this.speedX = BALL_BASE_SPEED;
                this.speedY = 0;
                break;
            case 2: // haut
                this.speedX = 0;
                this.speedY = -BALL_BASE_SPEED;
                break;
            case 3: // bas
                this.speedX = 0;
                this.speedY = BALL_BASE_SPEED;
                break;
            default:
                this.speedX = BALL_BASE_SPEED;
                this.speedY = 0;
        }
    }
    else
    {
        if (this.speedX > 0)
            this.speedX = BALL_BASE_SPEED;
        else
            this.speedX = -BALL_BASE_SPEED;
        this.speedY = 0;
    }
  }
}
