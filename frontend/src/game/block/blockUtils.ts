import { Block } from './Block';
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

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

	public reset(_x:number, _y:number, _speedx:number, _speedy:number) {
		this.x = _x
		this.y = _y
		this.radius = 10
		this.speedx = _speedx
		this.speedy = _speedy
	}

	public moveTo(_x:number, _y:number) {
		this.x = _x;
		this.y = _y;
	}

	public collisionPadd1(paddle: Paddle) {

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

	public collisionPadd2(paddle: Paddle) {

		if (!(this.y - this.radius <= paddle.y + paddle.height && 
			this.y + this.radius >= paddle.y))
			return;
			
		if (this.x + this.radius >= paddle.x && 
			this.x - this.radius <= paddle.x + paddle.width) {
			
			const relativeIntersectX = (this.x - paddle.x) / paddle.width;

			// Calculer l'angle de rebond basé sur la position d'impact
			const bounceAngle = (relativeIntersectX - 0.5) * Math.PI / 3; // Max 60°

			const speed = Math.sqrt(this.speedx * this.speedx + this.speedy * this.speedy);

			const leftEdge = paddle.x + paddle.width * 0.1;
			const rightEdge = paddle.x + paddle.width * 0.9;

			if (this.x < leftEdge) {
				this.speedx = -Math.abs(speed * Math.sin(bounceAngle));
				this.speedy = Math.abs(speed * Math.cos(bounceAngle));
			}
			else if (this.x > rightEdge) {
				this.speedx = Math.abs(speed * Math.sin(bounceAngle));
				this.speedy = Math.abs(speed * Math.cos(bounceAngle));
			}
			else {
				this.speedx = speed * Math.sin(bounceAngle);
				this.speedy = Math.abs(speed * Math.cos(bounceAngle));
			}

			if (this.speedy < 0)
				this.y = paddle.y + paddle.height + this.radius + 1;
		}	
	}

	public collisionWindow(width: number, flag:boolean) {

		if (flag && this.y - this.radius <= 0) {
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
	protected x: number;
	protected y: number;


	constructor(_hp:number,_id:number, _type:string, _color:string, _x:number, _y:number) {
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

	public getHp(): number { return (this.hp); }
	public getId(): number { return (this.id); }
	public getType(): string { return (this.type); }
	public getColor(): string { return (this.color); }
	public getX(): number { return (this.x); }
	public getY(): number { return (this.y); }
	

}

class blue extends brick {
	constructor(_id:number, _x:number, _y:number) {
		super(1, _id, "blue", "#4780B1", _x, _y); }
}

class green extends brick {
	constructor(_id:number, _x:number, _y:number) {
		super(2, _id, "green", "#61AB39", _x, _y); }
}

class red extends brick {
	constructor(_id:number, _x:number, _y:number) {
		super(3, _id, "red", "#FF101F", _x, _y); }
}

export function	createRandomBrick(it:number, _x:number, _y:number): brick {

	const rand = Math.floor(Math.random() * 3);

	if (rand === 0)
		return (new red(it, _x, _y));
	if (rand === 1)
		return (new green(it, _x, _y));
	return (new blue(it, _x, _y));
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

export async function logStartingGame(username:string): Promise<number> {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return -1;
		}

		const response = await fetch('http://localhost:8000/games', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
			body: JSON.stringify({
				game_name: 'block',
				chef: "maestro",
				player1: username,
				player2: "ines",
				start_time: Date.now().toString(),
			})
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log("game bien log", result);
			return (result.gameId);
		}
		else 
			console.error("Erreur lors de log une game");
	}
	catch (error) {
		console.error("Error saving a game: ", error); }
	return -1;
}

export async function logEndGame(gameId: number, winner:string) {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch('http://localhost:8000/games', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
			body: JSON.stringify({
				gameId: gameId,
				winner: winner,
				end_time: Date.now().toString()
			})
		});

		
	
		if (response.ok) {
			const result = await response.json();
			console.log("endgame bien log", result);
		}
		else 
			console.error("Erreur lors de log une game");
	}
	catch (error) {
		console.error("Error saving a game: ", error); }
}

// export async function updateStats(gameId:number)