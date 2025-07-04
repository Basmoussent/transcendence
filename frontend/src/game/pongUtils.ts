export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PADDLE_OFFSET = 30;

export class Paddle {
    name: string;
    ia: boolean;
    width: number;
    height: number;
    x: number;
    y: number;
    speed: number;
    score: number;
    scorex: number;
    scorey: number;

    constructor(width: number, height: number, x: number, y: number, speed: number) {
        this.name = "player";
        this.ia = false;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.score = 0;
        this.scorex = 0;
        this.scorey = 0;
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

    updatePaddleUpDown(keys: { [key: string]: boolean }, upKey: string, downKey: string, paddles: [Paddle, Paddle, (Paddle | null)?, (Paddle | null)?], canvasWidth: number): void {
        const player1 = paddles[0]; // gauche
        const player2 = paddles[1]; // droite

        if (keys[downKey]) {
            let canMove = true;
            const verticalOverlap = this.y < player2.y + player2.height && this.y + this.height > player2.y;
            const horizontalCollision = this.x + this.width >= player2.x - PADDLE_OFFSET;

            if (verticalOverlap && horizontalCollision)
                canMove = false;

            if (canMove)
                this.moveRight(canvasWidth);
            else
                this.x = canvasWidth - PADDLE_OFFSET - this.width - paddles[1].width;
        }

        if (keys[upKey]) {
            let canMove = true;
            const verticalOverlap = this.y < player1.y + player1.height && this.y + this.height > player1.y;
            const horizontalCollision = this.x <= player1.x + player1.width + PADDLE_OFFSET;

            if (verticalOverlap && horizontalCollision)
                canMove = false;

            if (canMove)
                this.moveLeft();
            else
                this.x = PADDLE_OFFSET + paddles[0].width;
        }
  }

  updatePaddleRightLeft(keys: { [key: string]: boolean }, upKey: string, downKey: string, paddles: [Paddle, Paddle, (Paddle | null)?, (Paddle | null)?], canvasHeight: number): void {
    const player3 = paddles[2]; // haut
    const player4 = paddles[3]; // bas

    if (keys[upKey]) {
      let canMove = true;
      if (player3) {
        const horizontalOverlap = this.x < player3.x + player3.width && this.x + this.width > player3.x;
        const verticalCollision = this.y <= player3.y + player3.height + PADDLE_OFFSET;

        if (horizontalOverlap && verticalCollision)
          canMove = false;

        if (canMove)
          this.moveUp();
        else
          this.y = PADDLE_OFFSET + player3.height; // eviter collision avec player3
      }
    }

    if (keys[downKey]) {
      let canMove = true;
      if (player4) {
        const horizontalOverlap = this.x < player4.x + player4.width && this.x + this.width > player4.x;
        const verticalCollision = this.y + this.height >= player4.y - PADDLE_OFFSET;

        if (horizontalOverlap && verticalCollision)
          canMove = false;

        if (canMove)
          this.moveDown(canvasHeight);
        else
          this.y = canvasHeight - PADDLE_OFFSET - player4.height - this.height; // eviter collision avec player4
      }
    }
  }
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

    constructor(canvasWidth: number, canvasHeight: number) {
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
}
