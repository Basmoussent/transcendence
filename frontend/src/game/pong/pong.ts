import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { PaddleAI } from "./paddle-ai";
import { PADDLE_OFFSET, PADDLE1_COLOR, PADDLE2_COLOR } from "./const";
import { getAuthToken } from '../../utils/auth';
import { addEvent } from '../../utils/eventManager';
import { t } from '../../utils/translations';

export interface Game {
	id: number,
	uuid: string,
	game_type: string,
	player1: string,
	player2: string,
	player3: string,
	player4: string,
	ai: number,
	users_needed: number,
}

interface player1{
	name : string;
	score: number;
}

export class Pong {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private start: boolean;
	private end: boolean;
	private lastPlayerColl: number; // pour savoir qui va gagner le point
	private paddles: [Paddle, Paddle | PaddleAI];
	private ball: Ball;
	private keys: { [key: string]: boolean };
	private winner: string;
	private start_time: string;

	private data: any;

	// constructor(canvas: HTMLCanvasElement, player1ID: number, player2ID: number) {
	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2D context');
		}

		this.ctx = context;
		this.height = canvas.height;
		this.width = canvas.width;
		this.start = false;
		this.end = false;
		this.lastPlayerColl = -1;
		this.start_time = Date.now().toString();

		// this.paddles = this.initPlayers();
		this.paddles = [
			new Paddle(20, 100, PADDLE1_COLOR),
			new Paddle(20, 100, PADDLE2_COLOR)
		]

		this.ball = new Ball(this.height, this.width);
		this.keys = {};
		this.winner = "";

		// this.retrieveGameInfo(uuid);
	}

	public init(p1: string, p2: string): { player1: player1, player2: player1 } {
		console.log('Initializing paddle game...');
		this.setupCanvas();
		this.setupEventListeners();
		this.startGameLoop();

		// on resize si la taille de la fenetre change
		window.addEventListener('resize', () => {
			this.setupCanvas();
		});
		
		this.paddles[0].name = p1;
		this.paddles[1].name = p2;
		const player1 = {name: p1, score: this.paddles[0].score} as player1;
		const player2 = {name: p2, score: this.paddles[1].score} as player1;

		return {player1, player2};
	};

	// private async retrieveGameInfo(uuid: string) {
		
	// 	const authToken = getAuthToken()
	// 	if (!authToken) {
	// 		alert('❌ Token d\'authentification manquant');
	// 		window.history.pushState({}, '', '/login');
	// 		window.dispatchEvent(new PopStateEvent('popstate'));
	// 		return;
	// 	}

	// 	const response = await fetch(`/api/games/?uuid=${uuid}`, {
	// 		method: 'GET',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'x-access-token': authToken
	// 			},
	// 	});

	// 	if (!response.ok) {
	// 		const errorData = await response.json();
	// 		throw new Error(errorData.details || "pblm recuperer les infos de la game le multipong");
	// 	}

	// 	const result = await response.json();

	// 	this.data = {
	// 		id: result.game.id,
	// 		uuid: result.game.uuid,
	// 		game_type: result.game.game_type,
	// 		player1: result.game.player1,
	// 		player2: result.game.player2,
	// 		player3: result.game.player3,
	// 		player4: result.game.player4,
	// 		users_needed: result.game.users_needed,
	// 		ai: result.game.ai,
	// 	}

	// 	// console.log(`les infos de la game => ${JSON.stringify(this.data, null, 12)}`)
	// }

	// private initPlayers(): [Paddle, Paddle | PaddleAI] {
	// 	let ai_player = this.data.ai;

	// 	const paddle1 = new Paddle(20, 100, PADDLE1_COLOR); // player1 toujours un player
	// 	let paddle2: Paddle | PaddleAI;

	// 	if (ai_player > 0)
	// 		paddle2 = new PaddleAI(20, 100, PADDLE2_COLOR);
	// 	else
	// 		paddle2 = new Paddle(20, 100, PADDLE2_COLOR);

	// 	return [paddle1, paddle2];
	// }

	// positions et tailles de base en fonction de la taille du canvas
	private setupPaddles(): void {
		this.paddles[0].x = PADDLE_OFFSET;
		this.paddles[0].y = (this.height - this.paddles[0].height) / 2;

		this.paddles[1].x = this.width - this.paddles[1].width - PADDLE_OFFSET;
		this.paddles[1].y = (this.height - this.paddles[1].height) / 2;
	}

	private setupCanvas(): void {
		this.canvas.width = this.canvas.clientWidth || 800;
		this.canvas.height = this.canvas.clientHeight || 600;
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		this.setupPaddles();

		this.ball.radius = this.paddles[0].width / 2;
		this.ball.x = this.width / 2;
		this.ball.y = this.height / 2;
	}

	// pendant qu'on appuie sur une touche this.keys[touche] = true
	private setupEventListeners(): void {
		addEvent(window, 'keydown', (e) => {
			this.keys[e.key.toLowerCase()] = true;
		});

		addEvent(window, 'keyup', (e) => {
			this.keys[e.key.toLowerCase()] = false;
		});
	}

	private async startGameLoop(): Promise<void> {
	console.log('Starting game loop...');

	// fleche au lieu de function() pour que this fasse ref a Pong
	const gameLoop = () => {
			if (this.keys['enter'])
				this.start = true;
			if (this.start && !this.end) {
				this.update();
			}
			this.render();
			if (this.end) {
				this.logTournamentGame();
				return ;
			}
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}

	private displayStartMsg(): void {
		this.ctx.globalAlpha = 0.2;
		this.ctx.fillStyle = 'white';
		this.ctx.font = '48px gaming'; // changer police
		this.ctx.fillText(t('pong.pressEnterToStart'), this.width / 2 - 150, this.height / 2 - 30);
		this.ctx.fillText(t('pong.toStart'), this.width / 2 - 100, this.height / 2 + 50);
		this.ctx.globalAlpha = 1;
		}

		private drawLine(): void {
		this.ctx.globalAlpha = 0.2;
		this.ctx.beginPath();
		this.ctx.moveTo(this.width / 2, 30);
		this.ctx.lineTo(this.width / 2, this.height - 30);
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
		this.ctx.globalAlpha = 1;
	}

	private displayScore(): void {
		// ligne du milieu
		this.drawLine();

		// les scores
		this.paddles[0].displayScore(this.ctx, (this.width / 2) / 2, this.height / 2);
		this.paddles[1].displayScore(this.ctx, (this.width / 4) * 3, this.height / 2);
	}

	private displayEndMsg(): void {
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px gaming'; // changer police
        this.ctx.fillText("GAME OVER", this.width / 2 - 150, this.height / 2 - 30);
        this.ctx.globalAlpha = 1;
    }

	private startPoint(): void {
		const paddle = this.paddles[this.lastPlayerColl];
		if (paddle)
			paddle.score++;

		// faut faire un POST pour update score et etat de la partie
		for (let i = 0; i < 4; i++) {
			const paddle = this.paddles[i];
			if (paddle && paddle?.winsGame() === true) {
				this.end = true;
				this.winner = paddle.name;
				return;
			}
		}

		this.ball.resetBallInfo(this.width, this.height, this.lastPlayerColl);
		// celui qui gagne recoit la balle en premier

		// le point est rejoue si personne ne touche la balle
		this.lastPlayerColl = -1;
	}

	private ballPaddleCollision(): void {
		if (this.ball.x - this.ball.radius <= this.paddles[0].x + this.paddles[0].width && this.ball.y + this.ball.radius >= this.paddles[0].y && this.ball.y - this.ball.radius <= this.paddles[0].y + this.paddles[0].height && this.ball.x > this.paddles[0].x) {
			this.ball.speedX *= -1;
			this.ball.adjustBallDir(this.paddles[0]);
			this.ball.addBallSpeed();
			this.ball.x = this.paddles[0].x + this.paddles[0].width + this.ball.radius;

			this.lastPlayerColl = 0;
		}
		if (this.ball.x + this.ball.radius >= this.paddles[1].x && this.ball.y + this.ball.radius >= this.paddles[1].y && this.ball.y - this.ball.radius <= this.paddles[1].y + this.paddles[1].height && this.ball.x < this.paddles[1].x + this.paddles[1].width) {
			this.ball.speedX *= -1;
			this.ball.adjustBallDir(this.paddles[1]);
			this.ball.addBallSpeed();
			this.ball.x = this.paddles[1].x - this.ball.radius;

			this.lastPlayerColl = 1;
		}
	}

	private updateBall(ball: typeof this.ball): void {

		ball.x += ball.speedX;
		ball.y += ball.speedY;

		// check paddles collision + la balle prends en vitesse a chaque collision paddle + ajuster dir
		this.ballPaddleCollision();

		// check scored point et relancer si oui
		if (ball.x - ball.radius > this.width || ball.x + ball.radius <= 0)
			this.startPoint();

		// check wall collision haut
		if (ball.y - ball.radius <= 0)
			ball.speedY *= -1;

		// check wall collision bas
		if (ball.y + ball.radius >= this.height)
			ball.speedY *= -1;
	}

	private	updatePlayer1(): void {
			this.paddles[0].updatePaddleRightLeft(this.keys, 'w', 's', this.height);
	}

	private	updatePlayer2(): void {
		if (this.paddles[1] instanceof PaddleAI)
			this.paddles[1].botPlayer(this.ball, this.height);
		else
			this.paddles[1].updatePaddleRightLeft(this.keys, 'arrowup', 'arrowdown', this.height);
	}

	private update(): void {
		this.updatePlayer1();
		this.updatePlayer2();

		this.updateBall(this.ball);
	}

	private render(): void {

		// on efface tout
		this.ctx.clearRect(0, 0, this.width, this.height);

		// le fond
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, this.width, this.height);

		// les paddles + leur contour
		for (let i = 0; i < 4; i++) {
			const paddle = this.paddles[i];
			if (paddle)
			this.paddles[i]?.drawPaddle(this.ctx);
		}

		if (this.start && !this.end) {
			this.ball.drawBall(this.ctx, this.ball.x, this.ball.y, this.ball.radius);
			this.displayScore();
		}
		else {
			if (this.end)
				this.displayEndMsg();
			else
				this.displayStartMsg();
		}
	}

	private async logTournamentGame() {

		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Token d\'authentification manquant');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return -1;
			}

			const response = await fetch(`/api/games/tournament`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
				body: JSON.stringify({
					player1: this.paddles[0].name,
					player2: this.paddles[1].name,
					winner: this.winner,
					start_time: this.start_time,
				})
			});
		
			if (response.ok) {
				const result = await response.json();
				console.log("la game de tournoi est log", result);
			}
			else 
				console.error("erreur pour log la game du tounoir");
		}
		catch (err) {
			console.error("pblm dans pong.ts pour log la game")
		}
	}
}

