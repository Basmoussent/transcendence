import { Paddle } from "./paddle";
import { PaddleAI } from "./paddle-ai";

export class Ball {
  radius: number;
  x: number;
  y: number;
  speedx: number;
  speedy: number;

  constructor(canvasHeight: number, canvasWidth: number) {
    this.radius = 10;
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedx = 6;
    this.speedy = 0;
  }

  drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    console.log('drawing ball...');
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }

  addBallSpeed(): void {
    console.log('adding BallSpeed...');
    if (this.speedx > 0 && this.speedx < 12)
      this.speedx += 0.25;
    else if (this.speedx < 0 && this.speedx > -12)
      this.speedx -= 0.25;
  }

  adjustBallDir(paddle: Paddle | PaddleAI): void {
    console.log('adjusting normal ball dir...');
    const hitY = this.y;

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleCenter = paddle.y + paddle.height / 2;

    const edgeZone = paddle.height * 0.2;

    if (hitY <= paddleTop + edgeZone) // touche le bord haut
      this.speedy -= 3;
    else if (hitY >= paddleBottom - edgeZone) // touche le bord bas
      this.speedy += 3;
    else if (hitY <= paddleCenter) // touche cote haut (mais pas bord)
      this.speedy -= 1;
    else if (hitY > paddleCenter) // touche cote bas (mais pas bord)
      this.speedy += 1;
  }

  resetBallInfo(canvasWidth: number, canvasHeight: number): void {
    // replace la balle au centre
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;

    // celui qui gagne recoit la balle en premier
    this.speedx *= -1;
    this.speedy = 1;

    // on reset a la vitesse de base
    if (this.speedx > 0)
      this.speedx = 6;
    else
      this.speedx = -6;
  }

}
