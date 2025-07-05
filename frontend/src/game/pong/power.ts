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
