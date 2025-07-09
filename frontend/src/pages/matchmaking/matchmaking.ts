import { Game, fetchUsername, getUuid, postGame } from '../../game/gameUtils'
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { renderRoom } from '../room/room'

interface Available {
	game_name: string,
	player1: string,
	player2?: string,
	player3?: string,
	player4?: string,
	users_needed: number,
	divConverion(): string;
};

export async function loadAvailableGames(): Promise<string | -1> {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return -1;
		}

		const response = await fetch('/api/games/available', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			}
		});
		
		if (response.ok) {
			const result = await response.json();
			const available: Available[] = result.games.map((game:any) => ({
				gameId: sanitizeHtml(game.id),
				game_name: sanitizeHtml(game.game_name),
				player1: sanitizeHtml(game.player1),
				player2: sanitizeHtml(game?.player2),
				player3: sanitizeHtml(game?.player3),
				player4: sanitizeHtml(game?.player4),
				users_needed:(sanitizeHtml(game.users_needed)),
				divConverion(): string {
					return `<div class="bg-black h-32">${(this.player1)}
						<button class="p-2 button launch-button" id="join${this.gameId}Btn">Join</button>
						</div>`;
				}
			}));
			console.log("available games: ", );
			return (gamesToDiv(available));
		}
		else 
			console.error("retrieve available game failed");
	}
	catch (error) {
		console.error("retrieve available game failed", error); }
	return -1;
}

export async function gamesToDiv(games:Available[]): Promise<string> {

	let tmp:string = '';

	for (const game of games) {

		tmp += game.divConverion();
	}

	console.log("available games div: ", tmp);
	return tmp;
}

export class matchmaking {

	private pong: boolean;
	private brick: boolean;
	private _1player: boolean;
	private _2player: boolean;
	private _3player: boolean;
	private _4player: boolean;
	private ws: WebSocket;


	private homeBtn: HTMLElement;
	private pongBtn: HTMLElement;
	private blockBtn: HTMLElement;
	private _1playerBtn: HTMLElement;
	private _2playerBtn: HTMLElement;
	private _3playerBtn: HTMLElement;
	private _4playerBtn: HTMLElement;
	private launchBtn: HTMLElement;
	private resetBtn: HTMLElement;
	private options: HTMLElement;
	private username: string;

	constructor() {


		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/matchmaking`);

		this.homeBtn = this.getElement('homeBtn');
		this.pongBtn = this.getElement('pongBtn');
		this.blockBtn = this.getElement('blockBtn');
		this._1playerBtn = this.getElement('1playerBtn');
		this._2playerBtn = this.getElement('2playerBtn');
		this._3playerBtn = this.getElement('3playerBtn');
		this._4playerBtn = this.getElement('4playerBtn');
		this.launchBtn = this.getElement('launchBtn');
		this.resetBtn = this.getElement('resetBtn');
		this.options = this.getElement("game-options");

		this.pong = false;
		this.brick = false;
		this.username = "prout";
		this._1player = false;
		this._2player = false;
		this._3player = false;
		this._4player = false;

		this.loadUsername();
		this.setEvents();
	}

	private async loadUsername() {
		try {
			const name = await fetchUsername();
			this.username = name || 'unknown';
			console.log("C'est MOI", this.username);
		}
		catch (err) {
			console.error("Erreur fetchUsername :", err); }
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private currentOptions(): void {
		console.log('Game Mode States:', {
			brick: this.brick,
			pong: this.pong,
			_1player: this._1player,
			_2player: this._2player,
			_3player: this._3player,
			_4player: this._4player
			});
	}

	private changeStyle(el:HTMLElement, style:string): void {

		el.className = 'button';
		el.classList.add(style);


	}

	private setEvents(): void {


		this.homeBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new PopStateEvent('popstate'));
			this.currentOptions();
		});

		this.pongBtn.addEventListener('click', () => {

			if (this.pong)
				return ;

			this.pong = true;
			this._1player = false;
			this._1playerBtn.classList.add("player-button-grise");
			this._3playerBtn.classList.remove("player-button-grise");
			this._4playerBtn.classList.remove("player-button-grise");

			if (this.brick) {
				this.brick = false;
				this.blockBtn.classList.remove("chosen-button");
				this.blockBtn.classList.add("block-button");
			}

			this.pongBtn.classList.remove("pong-button");
			this.pongBtn.classList.add("chosen-button");
			console.log("pongBtn classes:", this.pongBtn.classList);

		});

		this.blockBtn.addEventListener('click', () => {
			if (this.brick)
				return ;

			this.brick = true;
			this._3player = false;
			this._4player = false;
			this._1playerBtn.classList.remove("player-button-grise");
			this._3playerBtn.classList.add("player-button-grise");
			this._4playerBtn.classList.add("player-button-grise");

			if (this.pong) {
				this.pong = false;
				this.pongBtn.classList.remove("chosen-button");
				this.pongBtn.classList.add("pong-button");

			}

			this.blockBtn.classList.remove("block-button");
			this.blockBtn.classList.add("chosen-button");
			console.log("blockBtn classes:", this.blockBtn.classList);

		});

		this._1playerBtn.addEventListener('click', () => {
			if (this._1player)
				return ;
			this._1player = !this._1player;
			if (this._1player) {
				this._2player = false;
				this._3player = false;
				this._4player = false;
			}
			this._1playerBtn.classList.add("chosen-button");
		});

		this._2playerBtn.addEventListener('click', () => {
			if (this._2player)
				return ;
			this._2player = !this._2player;
			if (this._2player) {
				this._1player = false;
				this._3player = false;
				this._4player = false;
			}
			this._2playerBtn.classList.add("chosen-button");
		});

		this._3playerBtn.addEventListener('click', () => {

			if (this._3player)
				return ;

			if (this.brick)
				return ;

			this._3player = !this._3player;
			if (this._3player) {
				this._1player = false;
				this._2player = false;
				this._4player = false;
			}
			this._3playerBtn.classList.add("chosen-button");

		});

		this._4playerBtn.addEventListener('click', () => {

			if (this._4player)
				return ;

			if (this.brick)
				return ;

			this._4player = !this._4player;
			if (this._4player) {
				this._1player = false;
				this._2player = false;
				this._3player = false;
			}
			this._4playerBtn.classList.add("chosen-button");

		});

		this.launchBtn.addEventListener('click', () => {

			
			

			this.options.style.display = "none"

			// creer le body pour la requete POST
			let tmp:Game = {
				game_name: this.pong ? "pong" : "block",
				player1: this.username,
				users_needed: this._1player ? 1 : this._2player ? 2 : this._3player ? 3 : 4
			}

			this.joinRoom(tmp);
			// a la fin de la game appeler une fonction pour update les stats de chaque joueur
			
		});

		this.resetBtn.addEventListener('click', () => {

			this.pong = false;
			
			this.brick = false;
			this._1player = false;
			this._2player = false;
			this._3player = false;
			this._4player = false;

			this.pongBtn.classList.remove("chosen-button");
			this.blockBtn.classList.remove("chosen-button");
			this._1playerBtn.classList.remove("chosen-button");
			this._2playerBtn.classList.remove("chosen-button");
			this._3playerBtn.classList.remove("chosen-button");
			this._4playerBtn.classList.remove("chosen-button");
			this._1playerBtn.classList.remove("player-button-grise");
			this._2playerBtn.classList.remove("player-button-grise");
			this._3playerBtn.classList.remove("player-button-grise");
			this._4playerBtn.classList.remove("player-button-grise");

			console.log("pongBtn classes:", this.pongBtn.classList);
			console.log("_1playerBtn classes:", this._1playerBtn.classList);

		});

		// this.joinBtn.addEventListener('click', () => {

		// boucler sur les join %d buttons de toutes les available games generees
		// => requete PUT vers api/games
		//	mettre le gameId dans le body
		//	rajouter mon username en tant que player --> comment savoir quel player !!
	}

	private async joinRoom(tmp: Game) {

		try {
			let id = await postGame(tmp);
			var uuid = await getUuid(id);

			renderRoom(uuid);

		}
		catch (err: any) {
			console.error('❌ Error retrieve game uuid', err); }

	}
}