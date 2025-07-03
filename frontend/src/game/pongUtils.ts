export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Paddle {
    name: string;
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