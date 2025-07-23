import { Ball } from "./multi-ball";
import { Paddle } from "./multi-paddle";
import { PaddleAI } from "./multi-paddle-ai";
import { getAuthToken } from '../../../utils/auth';
import { PADDLE_OFFSET, Player, PADDLE1_COLOR, PADDLE2_COLOR, PADDLE3_COLOR, PADDLE4_COLOR } from "../const";
import { addEvent } from '../../../utils/eventManager';
import { t } from '../../../utils/translations';
import { logStartGame } from "../../../game/gameUtils";
import { fetchUserInfo } from '../../../pages/chat/utils'

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

export class MultiPong {
    private canvas: HTMLCanvasElement;

    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private start: boolean;
    private end: boolean;
    private lastPlayerColl: number; // pour savoir qui va gagner le point
    private paddles: [Paddle, Paddle | PaddleAI, Player?, Player?];
    private ball: Ball;
    private keys: { [key: string]: boolean };
    private uuid: string;
    private winner: string;

	private data: any;

    constructor(canvas: HTMLCanvasElement, uuid: string) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context');
        }
        this.uuid = uuid;
        this.ctx = context;
        this.height = canvas.height;
        this.width = canvas.width;
        this.start = false;
        this.end = false;
        this.lastPlayerColl = -1;
        this.data = null; // sera rempli dans asyncInit
        this.paddles = [undefined, undefined, undefined, undefined] as unknown as [Paddle, Paddle | PaddleAI, Player?, Player?]; // sera rempli dans asyncInit
        this.ball = null as any; // sera rempli dans asyncInit
        this.keys = {};
        this.winner = "";
    }

    public async asyncInit(): Promise<void> {
        this.data = await this.loadInfo(this.uuid);
        console.log("data dans asyncInit", this.data);

        this.paddles = this.initPlayers();

        const user1 = await fetchUserInfo(String(this.data.player1));
        const user2 = await fetchUserInfo(String(this.data.player2));
        const user3 = await fetchUserInfo(String(this.data.player3));
        const user4 = await fetchUserInfo(String(this.data.player4));

        // fetchuserinfo renvoie toutes les infos du user

        if (user == null)
            console.error("les pblms");

        this.paddles[0].name = user.username;

        console.log("le name est ttttttttttt         ", this.paddles[0].name)


        this.ball = new Ball(this.height, this.width);

        this.setupCanvas();
        this.setupEventListeners();
        logStartGame(this.data.id); // start ici
        this.startGameLoop();

        // on resize si la taille de la fenetre change
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    private async loadInfo(uuid: string): Promise<any> {
            let tmp = await this.retrieveGameInfo(uuid);

            return tmp;
    }

	private async retrieveGameInfo(uuid: string) {

		const authToken = getAuthToken()
		if (!authToken) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return;
		}

		const response = await fetch(`/api/games/?uuid=${uuid}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': authToken
				},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.details || "pblm recuperer les infos de la game le multipong");
		}

		const result = await response.json();


		const data = {
			id: result.game.id,
			uuid: result.game.uuid,
			game_type: result.game.game_type,
			player1: result.game.player1,
			player2: result.game.player2,
			player3: result.game.player3,
			player4: result.game.player4,
			users_needed: result.game.users_needed,
			ai: result.game.ai
		}

        console.log(`les infos de la game => ${JSON.stringify(data, null, 12)}`)
        return (data)
	}

    private initPlayers(): [Paddle, Paddle | PaddleAI, Player?, Player?] {

        console.log(`les infos de ladqwdqwdqwdqwdq game => ${JSON.stringify(this.data, null, 12)}`)

        let players: number = this.data.users_needed - 1;
        let ai_players: number = this.data.ai;



        const paddles: Player[] = [];

        // player1 toujours un player
        paddles.push(new Paddle(20, 100, PADDLE1_COLOR));

        // player2 soit un player soit une ia
        if (players > 0) {
            paddles.push(new Paddle(20, 100, PADDLE2_COLOR));
            players -= 1;
        }
        else {
            paddles.push(new PaddleAI(20, 100, PADDLE2_COLOR));
            ai_players -= 1;
        }

        // player3 soit player soit ia soit aucun des deux
        if (players > 0) {
            paddles.push(new Paddle(100, 20, PADDLE3_COLOR));
            players -= 1;
        }
        else if (ai_players > 0) {
            paddles.push(new PaddleAI(100, 20, PADDLE3_COLOR));
            ai_players -= 1;
        }
        else
            paddles.push(null);

        // player4 soit player soit ia soit aucun des deux
        if (players > 0) {
            paddles.push(new Paddle(100, 20, PADDLE3_COLOR));
            players -= 1;
        }
        else if (ai_players > 0) {
            paddles.push(new PaddleAI(100, 20, PADDLE4_COLOR));
            ai_players -= 1;
        }
        else
            paddles.push(null);

        return paddles as [Paddle, Paddle | PaddleAI, Player?, Player?];
    }

    public init(): void {
        console.log('Initializing paddle game...');
        this.setupCanvas();
        this.setupEventListeners();
        this.startGameLoop();

        // on resize si la taille de la fenetre change
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    // positions et tailles de base en fonction de la taille du canvas
    private setupPaddles(): void {
        this.paddles[0].x = PADDLE_OFFSET;
        this.paddles[0].y = (this.height - this.paddles[0].height) / 2;

        this.paddles[1].x = this.width - this.paddles[1].width - PADDLE_OFFSET;
        this.paddles[1].y = (this.height - this.paddles[1].height) / 2;

        const player3 = this.paddles[2];
        if (player3) {
            player3.x = this.width / 2 - player3.width / 2;
            player3.y = PADDLE_OFFSET;
        }

        const player4 = this.paddles[3];
        if (player4) {
            player4.x = this.width / 2 - player4.width / 2;
            player4.y = this.height - player4.height - PADDLE_OFFSET;
        }
    }

    private setupCanvas(): void {
        this.canvas.width = this.canvas.clientWidth || 600;
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

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const gameLoop = async () => {
            if (this.keys['enter']) {
                this.start = true;
                // logStartGame(this.data.id);
            }
            if (this.start && !this.end)
                this.update();
            this.render();
            if (this.end) {
                await this.logGame();
                await sleep(2500);

                window.history.pushState({}, '', '/main');
                window.dispatchEvent(new PopStateEvent('popstate'));
                return;
            }
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    private displayStartMsg(): void {
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px gaming'; // changer police
        this.ctx.fillText(t('pong.pressEnterToStart'), this.width / 2 - 190, this.height / 2 - 100);
        this.ctx.fillText(t('pong.toStart'), this.width / 2 - 140, this.height / 2 - 50);
        this.ctx.fillStyle = PADDLE1_COLOR;
        this.ctx.fillText("PLAYER 1: W/S KEYS", this.width / 2 - 280, this.height / 2 + 20);
        this.ctx.fillStyle = PADDLE2_COLOR;
        this.ctx.fillText("PLAYER 2: ARROW KEYS", this.width / 2 - 330, this.height / 2 + 70);
        if (this.paddles[2]) {
            this.ctx.fillStyle = PADDLE3_COLOR;
            this.ctx.fillText("PLAYER 3: K/L KEYS", this.width / 2 - 280, this.height / 2 + 120);
        }
        if (this.paddles[3]) {
            this.ctx.fillStyle = PADDLE3_COLOR;
            this.ctx.fillText("PLAYER 4: 5/6 KEYS", this.width / 2 - 280, this.height / 2 + 170);
        }
        this.ctx.globalAlpha = 1;
}

    private displayEndMsg(): void {
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px gaming';
        this.ctx.fillText(`${this.winner} WINS`, this.width / 2, this.height / 2);
        this.ctx.globalAlpha = 1;
    }

    private drawLine(): void {
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 30);
        this.ctx.lineTo(this.width / 2, this.height - 30);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    private multiScore(): void {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const playerCount = this.getNbrOfPlayers();

        const spacing = 60; // entre chaque score
        const totalWidth = (playerCount - 1) * spacing;
        const startX = this.width / 2 - (totalWidth / 2);

        // affiche score au milieu avec couleur du joueur
        let activeIndex = 0;
        for (let i = 0; i < this.paddles.length; i++) {
            const paddle = this.paddles[i];
            if (paddle) {
                this.ctx.fillStyle = paddle.color;
                this.ctx.fillText(
                    paddle.score.toString(),
                    startX + (activeIndex * spacing),
                    this.height / 2
                );
                activeIndex++;
            }
        }

        // remet params par défaut
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'alphabetic';
    }

    private displayScore(): void {
        this.ctx.globalAlpha = 0.2;

        // ligne du milieu que si y'a 2 joueurs avec transparance
        if (this.paddles[2] === null && this.paddles[3] === null)
            this.drawLine();

        this.ctx.globalAlpha = 1;

        // les scores
        if (this.paddles[2] || this.paddles[3])
            this.multiScore();
        else {
            this.paddles[0].displayScore(this.ctx, (this.width / 2) / 2, this.height / 2);
            this.paddles[1].displayScore(this.ctx, (this.width / 4) * 3, this.height / 2);
        }
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

        // le point est rejoue si personne ne touche la balle
        this.lastPlayerColl = -1;
    }

    private getNbrOfPlayers(): number {
        return this.paddles.filter(paddle => paddle !== null && paddle !== undefined).length;
    }

    private adjustBallDirMultiplayer(ball: typeof this.ball, paddle: typeof this.paddles[2] | typeof this.paddles[3] | null): void {
        if (!paddle)
            return;

        const hitX = ball.x;

        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleCenter = paddle.x + paddle.width / 2;
        const edgeZone = paddle.width * 0.2;

        if (hitX <= paddleLeft + edgeZone) // bord gauche
            ball.speedX -= 4;
        else if (hitX >= paddleRight - edgeZone) // bord droit
            ball.speedX += 4;
        else if (hitX <= paddleCenter) // cote gauche
            ball.speedX -= 2;
        else if (hitX > paddleCenter) // cote droit
            ball.speedX += 2;
    }

    private ballPaddleCollision(): void {
        if (this.ball.x - this.ball.radius <= this.paddles[0].x + this.paddles[0].width && this.ball.y + this.ball.radius >= this.paddles[0].y && this.ball.y - this.ball.radius <= this.paddles[0].y + this.paddles[0].height && this.ball.x > this.paddles[0].x) {

            if (this.getNbrOfPlayers() < 3)
                this.ball.addBallSpeed();
            this.ball.speedX *= -1;
            this.ball.adjustBallDir(this.paddles[0]);

            if (this.getNbrOfPlayers() > 2)
                this.addBallDeviation();

            this.ball.x = this.paddles[0].x + this.paddles[0].width + this.ball.radius;

            this.lastPlayerColl = 0;
        }
        if (this.ball.x + this.ball.radius >= this.paddles[1].x && this.ball.y + this.ball.radius >= this.paddles[1].y && this.ball.y - this.ball.radius <= this.paddles[1].y + this.paddles[1].height && this.ball.x < this.paddles[1].x + this.paddles[1].width) {
            if (this.getNbrOfPlayers() < 3)
                this.ball.addBallSpeed();
            this.ball.speedX *= -1;
            this.ball.adjustBallDir(this.paddles[1]);

            if (this.getNbrOfPlayers() > 2)
                this.addBallDeviation();

            this.ball.x = this.paddles[1].x - this.ball.radius;

            this.lastPlayerColl = 1;
        }
    }

    private ballMultiplayerCollision(): void {
        const player3 = this.paddles[2]; // haut

        if (player3 &&
            this.ball.y - this.ball.radius <= player3.y + player3.height &&
            this.ball.x + this.ball.radius >= player3.x &&
            this.ball.x - this.ball.radius <= player3.x + player3.width &&
            this.ball.y > player3.y) {

            this.ball.speedY *= -1;
            this.adjustBallDirMultiplayer(this.ball, player3);
            this.addBallDeviation();
            // repositionner balle pour eviter comportement bizarre
            this.ball.y = player3.y + player3.height + this.ball.radius + 0.1;

            this.lastPlayerColl = 2;
        }

        const player4 = this.paddles[3]; // bas

        if (player4 &&
            this.ball.y + this.ball.radius >= player4.y &&
            this.ball.x + this.ball.radius >= player4.x &&
            this.ball.x - this.ball.radius <= player4.x + player4.width &&
            this.ball.y < player4.y + player4.height) {

            this.ball.speedY *= -1;
            this.adjustBallDirMultiplayer(this.ball, player4);
            this.addBallDeviation();

            // repositionner balle pour eviter comportement bizarre
            this.ball.y = player4.y - this.ball.radius - 0.1;

            this.lastPlayerColl = 3;
        }
    }

    private addBallDeviation(): void {
        const deviationStrength = 1.5;

        // pour rendre mvmt de balle moins previsible
        const randomFactor = (Math.random() - 0.5) * 0.5;

        // si la balle va principalement horizontalement, ajouter plus de vitesse verticale
        if (Math.abs(this.ball.speedX) > Math.abs(this.ball.speedY)) {
            const verticalBoost = deviationStrength + randomFactor;
            this.ball.speedY += this.ball.speedY > 0 ? verticalBoost : -verticalBoost;
        }
        // si la balle va principalement verticalement, ajouter plus de vitesse horizontale
        else {
            const horizontalBoost = deviationStrength + randomFactor;
            this.ball.speedX += this.ball.speedX > 0 ? horizontalBoost : -horizontalBoost;
        }
    }

    private updateBall(ball: typeof this.ball): void {
        const player3 = this.paddles[2];
        const player4 = this.paddles[3];

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // check paddles collision + la balle prends en vitesse a chaque collision paddle + ajuster dir
        this.ballPaddleCollision();
        if (player3 || player4)
            this.ballMultiplayerCollision();

        // check scored point et relancer si oui
        if (ball.x - ball.radius > this.width || ball.x + ball.radius <= 0 || (player3 && ball.y + ball.radius < 0) || (player4 && ball.y - ball.radius > this.height))
            this.startPoint();

        // check wall collision haut
        if (!player3 && ball.y - ball.radius <= 0)
            ball.speedY *= -1;

        // check wall collision bas
        if (!player4 && ball.y + ball.radius >= this.height)
            ball.speedY *= -1;
    }

    private updatePlayer1(): void {
        this.paddles[0].updatePaddleRightLeft(this.keys, 'w', 's', this.paddles, this.height);
    }

    private updatePlayer2(): void {
        if (this.paddles[1] instanceof PaddleAI)
        {
            this.paddles[1].botPlayer2(this.ball, this.paddles, this.height);
        }
        else {
            this.paddles[1].updatePaddleRightLeft(this.keys, 'arrowup', 'arrowdown', this.paddles, this.height);
        }
    }

    private updatePlayer3(): void {
        const player3 = this.paddles[2];
        if (player3 && player3 instanceof PaddleAI) {
            player3?.botPlayer(this.ball, this.paddles, this.width, this.height);
        }
        else if (player3) {
            player3?.updatePaddleUpDown(this.keys, 'k', 'l', this.paddles, this.width);
        }
    }

    private updatePlayer4(): void {
        const player4 = this.paddles[3];
        if (player4 && player4 instanceof PaddleAI) {
            player4?.botPlayer(this.ball, this.paddles, this.width, this.height);
        }
        else if (player4) {
            player4?.updatePaddleUpDown(this.keys, '5', '6', this.paddles, this.width);
        }
    }

    private update(): void {
        this.updatePlayer1();
        this.updatePlayer2();
        this.updatePlayer3();
        this.updatePlayer4();

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

    private async logGame() {

		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Token d\'authentification manquant');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return -1;
			}

			const response = await fetch(`/api/games/finish/${this.uuid}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
				body: JSON.stringify({
					winner: this.winner
				})
			});
		
			if (response.ok) {
				const result = await response.json();
				console.log("la game de room est log", result);
			}
			else 
				console.error("erreur pour log la game de room");
		}
		catch (err) {
			console.error("pblm dans multipong.ts pour log la game")
		}
	}
}
