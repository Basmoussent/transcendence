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
		this.width = 10000
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
	public flag: boolean
	
	constructor(_x:number, _y:number, _radius:number) {
		this.x = _x
		this.y = _y
		this.radius = _radius
		this.speedx = 10
		this.speedy = 10
		this.flag = true
	}

	public move() {
		this.x += this.speedx;
		this.y += this.speedy;
	}

	public reset(_x:number, _y:number, _radius:number) {
		this.x = _x
		this.y = _y
		this.radius = _radius
		this.speedx = 80
		this.speedy = 80
	}

	public collisionPadd(paddle: Paddle) {

		// si la prochaine pos est plus basse que le y du paddle
		if (this.y + this.radius + this.speedy >= paddle.y) {

			var	it = 0;

			// boucle tant qu'on est pas sur le y du paddle
			for (; this.y + it != this.y + this.radius + this.speedy; ++it)
				if (this.y + it >= paddle.y)
					break;

			console.log("on va check pour ", this.y + it);

			// regarder si le x a ce moment est sur l'intervalle paddle.x, paddle.x + paddle.width
			if (this.speedx < 0 && this.x - it < paddle.x)
				return; // si la balle va vers la gauche et au moment ou les y sont les memes le x de la balle est inferieur au coin gauche du paddle
			else if (this.x + it > paddle.x + paddle.width)
				return;

			console.log("dans le mauvais");

			if (this.speedx > 0)
				this.moveTo(this.x + it, paddle.y - 1);
			else
				this.moveTo(this.x - it, paddle.y - 1);
			console.log(this.speedy)
			this.speedy *= -1;
			console.log("to ", this.speedy)
		}
	}

	public collisionWindow(width:number) {

		// collisions gauche droite
		if (this.x + this.speedx <= 0 || this.x + this.speedx >= width) {

			var it = 0;

			for (; it != this.speedx;) {
				this.speedx < 0 ? --it: ++it;
				if (this.x + it <= 0)
					break;
			}
			this.moveTo(this.x + it, this.y + it);
			this.speedx *= -1;
		}

		// collisions haut
		if (this.y + this.speedy <= 0) {
			var it = 0;

			for (; it != this.speedy;) {
				this.speedy < 0 ? --it: ++it;
				if (this.x + it <= 0)
					break;
			}
			this.moveTo(this.x + it, this.y + it);
			this.speedy *= -1;

		}
	}

	public lost(height:number) {
		if (this.y < height)
			return (false);
		// this.radius = 10;
		// this.x = width / 2;
		// this.y = height / 2;
		// this.speedx = 5;
		// this.speedy = 5;

		console.log("lost ", this.y);
		return (true);
	}

	public moveTo(_x:number, _y:number) {
		this.x = _x;
		this.y = _y;
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
		super(1, _id, "blue", "#00ABE7"); }
}

class green extends brick {
	constructor(_id:number) {
		super(1, _id, "green", "#81D17D"); }
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