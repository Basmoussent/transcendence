import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { PaddleAI } from "./paddle-ai";
import { Player } from "./const";

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Power {
  width: number;
  height: number;
  x: number;
  y: number;
  active: boolean;
  display: boolean;
  spawnTime: number;
  collisionTime: number | null;

  constructor(canvasHeight: number, canvasWidth: number) {
      this.width = 20;
      this.height = 20;
      this.x = randomInt((canvasWidth / 5) * 2, (canvasWidth / 5) * 4);
      this.y = randomInt(0, canvasHeight);
      this.active = false;
      this.display = false;
      this.spawnTime = Date.now() / 1000;
      this.collisionTime = null;
  }

  powerCollision(ballx: number, bally: number, ballradius: number) {
      // Trouver le point du rectangle le plus proche du centre du cercle
      const closestX = Math.max(this.x, Math.min(ballx, this.x + this.width));
      const closestY = Math.max(this.y, Math.min(bally, this.y + this.height));

      // Calculer la distance entre ce point et le centre du cercle
      const dx = ballx - closestX;
      const dy = bally - closestY;

      // Collision si distance^2 < rayon^2
      return (dx * dx + dy * dy) <= ballradius * ballradius;
  }

  drawPower(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ff0000';
    ctx.strokeStyle = '#ffffff';
    ctx.fillRect(
      this.x,
      this.y,
      this.width,
      this.height
    );
    ctx.strokeRect(
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  randomPaddle(nbrOfPlayers: number): number {
    if (nbrOfPlayers < 1 || nbrOfPlayers > 4)
      return -1;

    return (Math.floor(Math.random() * nbrOfPlayers - 1));
  }

  activateRandomPower(paddles: [Paddle, Paddle | PaddleAI, Player?, Player?], lastPlayerColl: number): void {
	  const rand = Math.floor(Math.random() * 2);
    const malusPlayer = this.randomPaddle(paddles.length);
    console.log('paddle malus = ', malusPlayer);

    // paddle plus grand pour celui qui a active le pouvoir
    if (rand == 1 && paddles[lastPlayerColl]) {
      if (lastPlayerColl == 0 || lastPlayerColl == 1)
        paddles[lastPlayerColl].height = paddles[lastPlayerColl]?.height / 3 * 4;
      else if (lastPlayerColl == 2 || lastPlayerColl == 3)
        paddles[lastPlayerColl].width = paddles[lastPlayerColl]?.width / 3 * 4;
    }

    // paddle plus petit pour un joueur random qui n'a pas active le pouvoir
    if (rand == 2 && malusPlayer > 0 && paddles[malusPlayer]) {
      if (malusPlayer == 0 || malusPlayer == 1)
        paddles[malusPlayer].height = paddles[malusPlayer]?.height / 3 * 2;
      else if (malusPlayer == 2 || malusPlayer == 3)
        paddles[malusPlayer].width = paddles[malusPlayer]?.width / 3 * 2;
    }

    // vitesse augmentee un peu pour celui qui gagne kle pouvoir
    if (rand == 2 && paddles[lastPlayerColl]) {
      paddles[lastPlayerColl].speed = 11;
    }
  }

  endPowerEffects(paddles: [Paddle, Paddle | PaddleAI, Player?, Player?]): void {
    for (let i = 0; i < 2; i++) {
			const paddle = paddles[i];
			if (paddle) {
        paddle.height = 100;
        paddle.width = 20;
      }
		}

    for (let i = 2; i < 4; i++) {
			const paddle = paddles[i];
			if (paddle) {
        paddle.speed = 8;
        paddle.height = 20;
        paddle.width = 100;
      }
		}
  }

  handlePower(ball: Ball, paddles: [Paddle, Paddle | PaddleAI, Player?, Player?], lastPlayerColl: number): void {
    const now = Date.now() / 1000;
    
    if (now - this.spawnTime >= 15) {
      console.log('cest le moment dactiver un power');
      this.active = true;
      this.display = true;
      this.spawnTime = now;
    }

    if (this.active) {

      if (this.powerCollision(ball.x, ball.y, ball.radius)) {
        this.display = false;
        this.collisionTime = now;

        this.activateRandomPower(paddles, lastPlayerColl);
      }

      if (this.collisionTime && now - this.collisionTime >= 8) {
        this.active = false;
        this.display = false;
        this.endPowerEffects(paddles);
      }
    }
  }
}
