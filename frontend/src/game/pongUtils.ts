export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
