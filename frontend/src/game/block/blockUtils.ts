import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

export class Paddle {
	public x: number;
	public y: number;
	public width: number;
	public height: number;
	public speed: number;

	constructor(_x: number, _y: number, _speed: number) {
		this.x = _x;
		this.y = _y;
		this.width = 150;
		this.height = 25;
		this.speed = _speed;
	}

	public move(direction: string, width: number) {
		if (direction === "left") {
			if (this.x - this.speed < 0)
				this.x = 0;
			else
				this.x -= this.speed;
		}
		else if (direction === "right") {
			if ((this.x + this.width + this.speed > width))
				this.x = width - this.width;
			else
				this.x += this.speed;
		}
	}
}

export class Ball {
	public x: number;
	public y: number;
	public radius: number;
	public speedx: number;
	public speedy: number;
	
	constructor(_x: number, _y: number) {
		this.x = _x;
		this.y = _y;
		this.radius = 8;
		this.speedx = 0;
		this.speedy = 0;
	}

	public move() {
		this.x += this.speedx;
		this.y += this.speedy;
	}

	public reset(_x: number, _y: number, _speedx: number, _speedy: number) {
		this.x = _x;
		this.y = _y;
		this.radius = 8;
		this.speedx = _speedx;
		this.speedy = _speedy;
	}

	public moveTo(_x: number, _y: number) {
		this.x = _x;
		this.y = _y;
	}

	// Collision simple avec la paddle (par le bas)
	public collisionPaddle(paddle: Paddle) {
		// Vérifier si la balle touche la paddle
		if (this.x + this.radius >= paddle.x && 
			this.x - this.radius <= paddle.x + paddle.width &&
			this.y + this.radius >= paddle.y && 
			this.y - this.radius <= paddle.y + paddle.height) {
			
			// Repositionner la balle au-dessus de la paddle
			this.y = paddle.y - this.radius;
			
			// Calculer l'angle de rebond basé sur la position d'impact
			const relativeIntersectX = (this.x - paddle.x) / paddle.width;
			const bounceAngle = (relativeIntersectX - 0.5) * Math.PI / 3; // Max 60° d'angle
			
			// Vitesse constante
			const speed = 6;
			this.speedx = speed * Math.sin(bounceAngle);
			this.speedy = -Math.abs(speed * Math.cos(bounceAngle));
		}
	}

	// Collision avec la paddle du haut (par le haut)
	public collisionPaddleTop(paddle: Paddle) {
		// Vérifier si la balle touche la paddle
		if (this.x + this.radius >= paddle.x && 
			this.x - this.radius <= paddle.x + paddle.width &&
			this.y + this.radius >= paddle.y && 
			this.y - this.radius <= paddle.y + paddle.height) {
			
			// Repositionner la balle en-dessous de la paddle
			this.y = paddle.y + paddle.height + this.radius;
			
			// Calculer l'angle de rebond basé sur la position d'impact
			const relativeIntersectX = (this.x - paddle.x) / paddle.width;
			const bounceAngle = (relativeIntersectX - 0.5) * Math.PI / 3; // Max 60° d'angle
			
			// Vitesse constante
			const speed = 6;
			this.speedx = speed * Math.sin(bounceAngle);
			this.speedy = Math.abs(speed * Math.cos(bounceAngle));
		}
	}

	// Collision avec les bords de l'écran
	public collisionWindow(width: number, height: number) {
		// Bord gauche
		if (this.x - this.radius <= 0) {
			this.x = this.radius;
			this.speedx = Math.abs(this.speedx);
		}
		// Bord droit
		else if (this.x + this.radius >= width) {
			this.x = width - this.radius;
			this.speedx = -Math.abs(this.speedx);
		}
		// Bord haut
		if (this.y - this.radius <= 0) {
			this.y = this.radius;
			this.speedy = Math.abs(this.speedy);
		}
	}

	// Vérifier si la balle touche une brique
	public checkBrickCollision(brickLeft: number, brickRight: number, brickTop: number, brickBottom: number): boolean {
		return this.x + this.radius >= brickLeft && 
			   this.x - this.radius <= brickRight &&
			   this.y + this.radius >= brickTop && 
			   this.y - this.radius <= brickBottom;
	}

	// Rebondir sur une brique
	public bounceOnBrick(brickLeft: number, brickRight: number, brickTop: number, brickBottom: number) {
		// Calculer les distances aux bords de la brique
		const distLeft = Math.abs(this.x - brickLeft);
		const distRight = Math.abs(this.x - brickRight);
		const distTop = Math.abs(this.y - brickTop);
		const distBottom = Math.abs(this.y - brickBottom);
		
		// Trouver le bord le plus proche
		const minDist = Math.min(distLeft, distRight, distTop, distBottom);
		
		// Rebondir sur le bord le plus proche
		if (minDist === distLeft) {
			this.x = brickLeft - this.radius;
			this.speedx = -Math.abs(this.speedx);
		} else if (minDist === distRight) {
			this.x = brickRight + this.radius;
			this.speedx = Math.abs(this.speedx);
		} else if (minDist === distTop) {
			this.y = brickTop - this.radius;
			this.speedy = -Math.abs(this.speedy);
		} else if (minDist === distBottom) {
			this.y = brickBottom + this.radius;
			this.speedy = Math.abs(this.speedy);
		}
	}
}

export abstract class brick {
	protected hp: number;
	protected id: number;
	protected type: string;
	protected color: string;
	protected x: number;
	protected y: number;

	constructor(_hp: number, _id: number, _type: string, _color: string, _x: number, _y: number) {
		this.hp = _hp;
		this.id = _id;
		this.type = _type;
		this.color = _color;
		this.x = _x;
		this.y = _y;
	}

	public beenHit(): void {
		this.hp--;
	}

	public getHp(): number { return this.hp; }
	public getId(): number { return this.id; }
	public getType(): string { return this.type; }
	public getColor(): string { return this.color; }
	public getX(): number { return this.x; }
	public getY(): number { return this.y; }
}

class BlueBrick extends brick {
	constructor(_id: number, _x: number, _y: number) {
		super(1, _id, "blue", "#95ADB6", _x, _y);
	}
}
class GreenBrick extends brick {
	constructor(_id: number, _x: number, _y: number) {
		super(2, _id, "green", "#8DA1B9", _x, _y);
	}
}
class RedBrick extends brick {
	constructor(_id: number, _x: number, _y: number) {
		super(3, _id, "red", "#CBB3BF", _x, _y);
	}
}

export function createRandomBrick(it: number, _x: number, _y: number): brick {
	const rand = Math.floor(Math.random() * 3);
	if (rand === 0) return new RedBrick(it, _x, _y);
	if (rand === 1) return new GreenBrick(it, _x, _y);
	return new BlueBrick(it, _x, _y);
}

// Supprimer PowerUpType, PowerUp, createRandomPowerUp, getPowerUpFromBrick
// Nettoyer la classe brick pour ne plus gérer de power-up


// export async function updateStats(gameId:number)