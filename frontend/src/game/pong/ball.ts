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
    this.speedX = 6;
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
      this.speedX += 0.25;
    else if (this.speedX < 0 && this.speedX > -12)
      this.speedX -= 0.25;
  }

  adjustBallDir(paddle: Paddle | PaddleAI): void {
    const hitY = this.y;

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleCenter = paddle.y + paddle.height / 2;

    const edgeZone = paddle.height * 0.2;

    if (hitY <= paddleTop + edgeZone) // touche le bord haut
      this.speedY -= 3;
    else if (hitY >= paddleBottom - edgeZone) // touche le bord bas
      this.speedY += 3;
    else if (hitY <= paddleCenter) // touche cote haut (mais pas bord)
      this.speedY -= 1;
    else if (hitY > paddleCenter) // touche cote bas (mais pas bord)
      this.speedY += 1;
  }

  resetBallInfo(canvasWidth: number, canvasHeight: number): void {
    // replace la balle au centre
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;

    // celui qui gagne recoit la balle en premier
    this.speedX *= -1;
    this.speedY = 1;

    // on reset a la vitesse de base
    if (this.speedX > 0)
      this.speedX = 6;
    else
      this.speedX = -6;
  }

}
