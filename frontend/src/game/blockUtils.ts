import { getAuthToken } from '../utils/auth';
import { sanitizeHtml } from '../utils/sanitizer';

export class Paddle {

	public x: number;
	public y: number;
	public width: number;
	public height: number;
	public speed: number;

	constructor(_x:number, _y:number, _speed:number) {
		this.x = _x
		this.y = _y
		this.width = 100
		this.height = 20
		this.speed = _speed
	}

	public move(direction:string, width:number) {
		if (direction == "left") {
			if (this.x - this.speed < 0)
				this.x = 0;
			else
				this.x -= this.speed;
		}
		else if (direction == "right") {
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
	
	constructor(_x:number, _y:number,) {
		this.x = _x
		this.y = _y
		this.radius = 10
		this.speedx = 0
		this.speedy = 0
	}

	public move() {
		this.x += this.speedx;
		this.y += this.speedy;
	}

	public reset(_x:number, _y:number,) {
		this.x = _x
		this.y = _y
		this.radius = 10
		this.speedx = 1
		this.speedy = 7
	}


	public lost(height:number): boolean {

		if (this.y + this.radius >= height)
			return true;
		return false;
	}

	public moveTo(_x:number, _y:number) {
		this.x = _x;
		this.y = _y;
	}

	public collisionPadd(paddle: Paddle) {

		if (!(this.y + this.radius >= paddle.y && 
			this.y - this.radius <= paddle.y + paddle.height))
			return;
			
		if (this.x + this.radius >= paddle.x && 
			this.x - this.radius <= paddle.x + paddle.width) {
			
			const relativeIntersectX = (this.x - paddle.x) / paddle.width;
			
			// Calculer l'angle de rebond basé sur la position d'impact
			// Centre de la palette = angle droit (90°)
			// Bords de la palette = angles plus aigus
			const bounceAngle = (relativeIntersectX - 0.5) * Math.PI / 3; // Max 60° d'angle
			
			const speed = Math.sqrt(this.speedx * this.speedx + this.speedy * this.speedy);
			
			const leftEdge = paddle.x + paddle.width * 0.1;
			const rightEdge = paddle.x + paddle.width * 0.9;
			
			if (this.x < leftEdge) {
				this.speedx = -Math.abs(speed * Math.sin(bounceAngle));
				this.speedy = -Math.abs(speed * Math.cos(bounceAngle));
			}
			else if (this.x > rightEdge) {
				this.speedx = Math.abs(speed * Math.sin(bounceAngle));
				this.speedy = -Math.abs(speed * Math.cos(bounceAngle));
			}
			else {
				this.speedx = speed * Math.sin(bounceAngle);
				this.speedy = -Math.abs(speed * Math.cos(bounceAngle));
			}
			
			if (this.speedy > 0)
				this.y = paddle.y - this.radius - 1;
		}		
	}

	public collisionWindow(width: number) {

		if (this.y - this.radius <= 0) {
			this.speedy = Math.abs(this.speedy);
			this.y = this.radius;
		}
		else if (this.x - this.radius <= 0) {
			this.speedx = Math.abs(this.speedx);
			this.x = this.radius;
		}
		else if (this.x + this.radius >= width) {
			this.speedx = -Math.abs(this.speedx);
			this.x = width - this.radius;
		}
	}

}

export abstract class brick {

	protected hp: number;
	protected id: number;
	protected type: string;
	protected color: string;

	constructor(_hp:number,_id:number, _type:string, _color:string) {
		this.hp = _hp;
		this.id = _id;
		this.type = _type;
		this.color = _color;
	}

	public beenHit(): void {
		this.hp--;
	}

	public getHp(): number { return (this.hp); }
	public getId(): number { return (this.id); }
	public getType(): string { return (this.type); }
	public getColor(): string { return (this.color); }
	

}

class blue extends brick {
	constructor(_id:number) {
		super(1, _id, "blue", "#4780B1"); }
}

class green extends brick {
	constructor(_id:number) {
		super(1, _id, "green", "#61AB39"); }
}

class red extends brick {
	constructor(_id:number) {
		super(1, _id, "red", "#FF101F"); }
}

export function	createRandomBrick(it:number): brick {

	const rand = Math.floor(Math.random() * 3);

	if (rand === 0)
		return (new red(it));
	if (rand === 1)
		return (new green(it));
	return (new blue(it));
}

let userData = {
	username: 'Username',
	email: 'email@example.com',
	avatar: 'avatar.png',
	wins: 0,
	games: 0,
	rating: 0,
	preferred_language: 'en'
};

export async function fetchUsername() {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch('/api/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		});
	
		if (response.ok) {
			const result = await response.json();
			userData = {
				username: sanitizeHtml(result.user?.username) || 'Username',
				email: sanitizeHtml(result.user?.email) || 'email@example.com',
				avatar: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				wins: (result.stats?.wins) || 0,
				games: (result.stats?.games) || 0,
				rating: (result.stats?.rating) || 0,
				preferred_language: sanitizeHtml(result.user?.language) || 'en'
				
			};
			console.log(userData);
			return (userData.username);
		}
		else 
			console.error('Erreur lors de la récupération des données utilisateur');
	}
	catch (error) {
		console.error("Error rendering profile page:", error); }
}