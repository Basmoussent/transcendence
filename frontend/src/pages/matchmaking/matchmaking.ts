import { Game, fetchUsername, getUuid, postGame } from '../../game/gameUtils'
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { addEvent, cleanEvents } from '../../utils/eventManager';

export interface Available {
	gameId: number,
	game_type: string,
	player1: string,
	player2?: string,
	player3?: string,
	player4?: string,
	users_needed: number,
	divConverion(): string;
};

export class matchmaking {

	private pong: boolean;
	private brick: boolean;
	private ws: WebSocket;

	private homeBtn: HTMLElement;
	private pongBtn: HTMLElement;
	private blockBtn: HTMLElement;
	private launchBtn: HTMLElement;
	private options: HTMLElement;
	private availableGames: HTMLElement;
	private username: string;

	private joinBtn: Map<number,HTMLElement> = new Map();

	constructor() {

		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/matchmaking`);

		this.username = "tmp";
		this.loadUsername();

		this.homeBtn = this.getElement('homeBtn');
		this.pongBtn = this.getElement('pongBtn');
		this.blockBtn = this.getElement('blockBtn');
		this.launchBtn = this.getElement('launchBtn');
		this.options = this.getElement("game-options");
		this.availableGames = this.getElement('available-games');

		// Ajouter un listener pour nettoyer quand l'utilisateur quitte la page
		window.addEventListener('beforeunload', () => {
			this.stopPolling();
			if (this.ws.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify({
					type: 'leave'
				}));
			}
		});

		this.pong = false;
		this.brick = false;

		this.gameOptions();
		this.setJoinBtns();
		this.launchRoom();

		this.setupMutationObserver();

		this.ws.onopen = () => {
			console.log(`${this.username} est arrive sur matchmaking`)
			this.updateUI();
			this.startPolling();
		}

		this.ws.onerror = (error) => {
			console.error(`❌ ${this.username} n'a pas pu creer de websocket:`, error)}

		this.ws.onclose = (event) => {
			console.log(`${this.username} part de la page matchmaking`);
			this.stopPolling();
		}

		this.ws.onmessage = (event) =>  {
			const data = JSON.parse(event.data);
			this.handleEvents(data);
		}

	}

	private setupMutationObserver() {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as Element;
				const joinButtons = element.querySelectorAll('[id^="join"][id$="Btn"]');
				
				joinButtons.forEach((btn) => {
					const gameId = btn.id.replace('join', '').replace('Btn', '');
					btn.addEventListener('click', () => {
					this.joinRoom(Number(gameId));
					});
				});
				}
			});
			});
		});

		observer.observe(document.body, { childList: true, subtree: true });

	}
	
	private async loadUsername() {
		try {
			const name = await fetchUsername();
			this.username = name || 'fetch username pas marché';
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
			pong: this.pong
			});
	}

	private gameOptions(): void {

		addEvent(this.pongBtn, 'click', () => {
			if (this.pong)
				return ;

			this.pong = true;

			if (this.brick) {
				this.brick = false;
				this.blockBtn.classList.remove("chosen-button");
				this.blockBtn.classList.add("block-button");
			}

			this.pongBtn.classList.remove("pong-button");
			this.pongBtn.classList.add("chosen-button");
			console.log("pongBtn classes:", this.pongBtn.classList);
		});

		addEvent(this.blockBtn, 'click', () => {
			if (this.brick)
				return ;

			this.brick = true;

			if (this.pong) {
				this.pong = false;
				this.pongBtn.classList.remove("chosen-button");
				this.pongBtn.classList.add("pong-button");
			}

			this.blockBtn.classList.remove("block-button");
			this.blockBtn.classList.add("chosen-button");
			console.log("blockBtn classes:", this.blockBtn.classList);
		});

		addEvent(this.homeBtn, 'click', () => {
			this.stopPolling();
			window.history.pushState({}, '', `/main`);
			window.dispatchEvent(new PopStateEvent('popstate'));
			this.ws.send(JSON.stringify({
				type: 'leave'
			}));
			this.ws.close();
		})
	}

	private async launchRoom() {

		addEvent(this.launchBtn, 'click', async () => {
			// Vérifier qu'un type de jeu est sélectionné
			if (!this.pong && !this.brick) {
				alert('Please select a game type first!');
				return;
			}

			let tmp = {
				game_type: this.pong ? "pong" : "block",
				player1: this.username,
				users_needed: 2 // Par défaut 2 joueurs, sera configuré dans la room
			}

			cleanEvents();

			var uuid = await postGame(tmp);

			this.options.style.display = "none"

			window.history.pushState({}, '', `/room/${uuid}`);
			window.dispatchEvent(new PopStateEvent('popstate'));

			this.ws.send(JSON.stringify({
				type: 'updateUI',
			}));
		});
	}

	private async joinRoom(gameId: number) {

		try {
			let uuid = await getUuid(gameId);

			window.history.pushState({}, '', `/room/${uuid}`);
			window.dispatchEvent(new PopStateEvent('popstate'));

		}
		catch (err: any) {
			console.error('❌ Error retrieve game uuid', err); }
	}

	private setJoinBtns() {

		for (let [id, btn] of this.joinBtn) {
			addEvent(btn, 'click', () => {
				this.joinRoom(Number(id));
			});
		}
	}

	private handleEvents(data: any) {

		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.warn('web socket pas ready')
			return;
		}

		switch (data.type) {
			case 'updateUI':
				console.log('Received updateUI event, updating available games...');
				this.updateUI();
				break;
			case 'notLog':
				this.stopPolling();
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new Event('popstate'));
				this.ws.close();
				break;
			
			default:
				console.warn(`event pas encore handled ${data.type}`)
		}
	}

	private async updateUI() {
		this.updateAvailableGames();
	}

	private async updateAvailableGames() {

		try {
			// Ajouter un indicateur de chargement
			const container = document.getElementById('available-games');
			if (container) {
				const loadingIndicator = document.createElement('div');
				loadingIndicator.className = 'loading-indicator';
				loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating games...';
				container.appendChild(loadingIndicator);
			}

			const gameList = await this.loadAvailableGames();
			
			if (gameList === -1) {
				console.log('No games available or error occurred');
				return;
			}
			
			const inject = await this.gamesToDiv(gameList);
			
			if (container && typeof inject === 'string') {
				this.availableGames.innerHTML = inject;
				console.log(`Updated available games: ${gameList.length} games found`);
			}
		} catch (error) {
			console.error('Error updating available games:', error);
		}
	}

	private async gamesToDiv(games:Available[]): Promise<string> {

		let tmp:string = '';
		for (const game of games)
			tmp += game.divConverion();

		return tmp;
	}

	private pollingInterval: number | null = null;

	private startPolling() {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
		}
		
		this.pollingInterval = setInterval(() => {
			if (this.ws.readyState === WebSocket.OPEN) {
				this.updateUI();
			}
		}, 3000);
	}

	private stopPolling() {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
			this.pollingInterval = null;
		}
	}

	private async loadAvailableGames(): Promise<Available[] | -1> {
	
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
					game_type: sanitizeHtml(game.game_type),
					player1: sanitizeHtml(game.player1),
					player2: sanitizeHtml(game?.player2),
					player3: sanitizeHtml(game?.player3),
					player4: sanitizeHtml(game?.player4),
					users_needed:(sanitizeHtml(game.users_needed)),
					divConverion(): string {
						// Calculer le nombre de joueurs actuels
						const currentPlayers = [this.player1, this.player2, this.player3, this.player4]
							.filter(player => player && player.trim() !== '').length;
						
						// Déterminer le statut
						const totalSlots = parseInt(this.users_needed) || 2;
						const isFull = currentPlayers >= totalSlots;
						
						const statusClass = isFull ? 'status-full' : (currentPlayers > 1 ? 'status-playing' : 'status-waiting');
						const statusText = isFull ? 'Full' : (currentPlayers > 1 ? 'Playing' : 'Waiting');
						
						// Générer la liste des joueurs
						const playersList = [this.player1, this.player2, this.player3, this.player4]
							.filter(player => player && player.trim() !== '')
							.join(', ');
						
						return `
							<div class="game-card" ${!isFull ? `onclick="joinGame('${this.gameId}')"` : ''}>
								<div class="game-header">
									<h3 class="game-title">${this.game_type}</h3>
									<span class="game-status ${statusClass}">${statusText}</span>
								</div>
								<div class="game-info">
									<div class="game-type">
										<i class="fas ${this.game_type.toLowerCase() === 'pong' ? 'fa-table-tennis' : 'fa-cubes'}"></i>
										<span>${this.game_type}</span>
									</div>
									<div class="player-count">
										<i class="fas fa-users"></i>
										<span>${currentPlayers}/${totalSlots}</span>
									</div>
								</div>
								${playersList ? `
									<div class="players-list">
										<i class="fas fa-user"></i>
										<span>${playersList}</span>
									</div>
								` : ''}
								${!isFull ? `
									<button class="join-button" id="join${this.gameId}Btn">
										<i class="fas fa-sign-in-alt"></i>
										Join Game
									</button>
								` : ''}
							</div>
						`;
					}
				}));
				console.log("available games: ", );
				return (available);
			}
			else 
				console.error("retrieve available game failed");
		}
		catch (error) {
			console.error("retrieve available game failed", error); }
		return -1;
	}
}