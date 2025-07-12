import { PADDLE_OFFSET, Player } from "./const";
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
    color: string;

    // ai
    lastRefresh: number | null;
    up: boolean;
    down: boolean;
    targetX: number;
    targetY: number;
    // mode: number; // easy = 0 / middle = 1 / hard = 2

    constructor(width: number, height: number, color: string) {
        this.name = "AI Player";
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.speed = 9;
        this.score = 0;
        this.color = color;

        // ia
        this.lastRefresh = null;
        this.up = false;
        this.down = false;
        this.targetX = 0;
        this.targetY = 0;
        // this.mode = mode;
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

    displayScore(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = this.color;
        ctx.font = '48px sans-serif'; // changer police
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

    updatePaddleUpDown(keys: { [key: string]: boolean }, upKey: string, downKey: string, paddles: [Paddle, Paddle | PaddleAI, Player?, Player?], canvasWidth: number): void {
        if (keys[downKey])
            this.checkAndMoveRight(paddles[1], canvasWidth);

        if (keys[upKey])
            this.checkAndMoveLeft(paddles[0]);
    }

    private canRefresh(): boolean {
        return this.lastRefresh === null || Date.now() / 1000 - this.lastRefresh >= 1;
    }

    easyUpDown(ball: Ball, paddles: [Paddle, Paddle | PaddleAI], canvasWidth: number): void {
        if (this.down && this.x < this.targetX)
            this.checkAndMoveRight(paddles[1], canvasWidth);

        if (this.up && this.x > this.targetX)
            this.checkAndMoveLeft(paddles[0]);

        if (this.canRefresh()) {
            if (ball.x > this.x) {
                this.down = true;
                this.up = false;
                this.targetX = ball.x;
            }
            else if (ball.x < this.x) {
                this.down = false;
                this.up = true;
                this.targetX = ball.x;
            }
            else if (ball.x == this.x) {
                this.down = false;
                this.up = false;
            }
            this.lastRefresh = Date.now() / 1000;
        }
    }

    // ne predit rien, essaye juste de suivre la balle
    easyRightLeft(ball: Ball, canvasHeight: number): void {
        // decalage de this.height / 2 pour que la balle touche le milieu du paddle
        if (this.up && this.y + this.height / 2 > this.targetY)
            this.moveUp();
        else if (this.down && this.y + this.height / 2 < this.targetY)
            this.moveDown(canvasHeight);

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
            }
            this.lastRefresh = Date.now() / 1000;
        }
    }

    // utilise les coordonnees de la balle et sa vitesse pour calculer targetY (chaque seconde)
    middleRightLeft(ball: Ball, canvasHeight: number): void {
        // decalage de this.height / 2 pour que la balle touche le milieu du paddle
        if (this.up && this.y > this.targetY)
            this.moveUp();
        else if (this.down && this.y < this.targetY)
            this.moveDown(canvasHeight);

        // the AI can only refresh its view of the game once per second
        if (this.canRefresh()) {
            const impactTime = (this.x - ball.x) / ball.speedX;
            const ballImpact = ball.y + ball.speedY * impactTime;
            const randomFactor = Math.random() * 0.2 + 0.1; // pour ne pas tjrs toucher la balle avec le milieu du paddle
            this.targetY = ballImpact - this.height / 2 - randomFactor;

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
    // hardRightLeft(ball: Ball, paddles: [Paddle, Paddle | PaddleAI, Player?, Player?], canvasHeight: number): void {
    // 	if (this.up && this.y > this.targetY)
    // 		this.checkAndMoveUp(paddles[2]);
    // 	else if (this.down && this.y < this.targetY)
    // 		this.checkAndMoveDown(paddles[3], canvasHeight);

    // 	// the AI can only refresh its view of the game once per second
    // 	if (this.canRefresh()) {
    // 		// calculer targetY et se diriger vers lui 
    // 		// else if la dir de la balle est pas vers nous alors on met les deux a false
    // 		this.lastRefresh = Date.now() / 1000;
    // 	}
    // }
}
