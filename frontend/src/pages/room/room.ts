import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

interface User {
	username: string;
	isReady: boolean;
	avatar?: string;
}

interface RoomData {
	id: string;
	name: string;
	gameType: 'pong' | 'block';
	maxPlayers: number;
	users: User[];
	host: string;
	isGameStarted: boolean;
	ai: number;
}

export class Room {

	private ws: WebSocket;
	private username: string;
	private uuid: string;
	private roomData: RoomData | null = null;

	private homeBtn: HTMLButtonElement;
	private readyBtn: HTMLButtonElement;
	private startBtn: HTMLButtonElement;
	private leaveBtn: HTMLButtonElement;
	private sendBtn: HTMLButtonElement;
	private increaseAiBtn: HTMLButtonElement;
	private decreaseAiBtn: HTMLButtonElement;


	private chatInput: HTMLInputElement;
	private playersContainer: HTMLElement;
	private roomNameEl: HTMLElement;
	private gameTypeEl: HTMLElement;
	private playerCountEl: HTMLElement;
	private gameStatusEl: HTMLElement;
	private roomSettings: HTMLElement;
	private aiCountSpan: HTMLElement;
	private maxPlayersSelect: HTMLSelectElement;
	private gameTypeSelect: HTMLSelectElement;
	private token: string | null;
	

	constructor(user: string, uuid: string) {
		this.username = user;
		this.uuid = uuid;

		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/room/${uuid}`);

		this.homeBtn = this.getElement('homeBtn') as HTMLButtonElement;
		this.readyBtn = this.getElement('readyBtn') as HTMLButtonElement;
		this.startBtn = this.getElement('startGameBtn') as HTMLButtonElement;
		this.leaveBtn = this.getElement('leaveBtn') as HTMLButtonElement;
		this.sendBtn = this.getElement('sendBtn') as HTMLButtonElement;
		this.increaseAiBtn = this.getElement('increaseAI') as HTMLButtonElement;
		this.decreaseAiBtn = this.getElement('decreaseAI') as HTMLButtonElement;
		this.chatInput = this.getElement('chatInput') as HTMLInputElement;
		this.playersContainer = this.getElement('playersContainer');
		this.roomSettings = this.getElement('roomSettings');
		this.roomNameEl = this.getElement('roomName');
		this.gameTypeEl = this.getElement('gameType');
		this.playerCountEl = this.getElement('playerCount');
		this.gameStatusEl = this.getElement('gameStatus');
		this.aiCountSpan = this.getElement('aiCount');
		this.gameTypeSelect = this.getElement("gameTypeSelect") as HTMLSelectElement;
		this.maxPlayersSelect = this.getElement('maxPlayersSelect') as HTMLSelectElement;

		this.token = getAuthToken();
		

		this.chatInput.focus();
		this.setupWsEvents();
		this.setupClickEvents();
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private setupWsEvents() {

		this.ws.onopen = () => {
			console.log(`✅ WebSocket connection established for room ${this.uuid}`);
			this.ws.send(JSON.stringify({
				type: 'update_db',
			}))
		};

		this.ws.onerror = (error) => console.error(`${this.username} onerror ${this.uuid}:`, error);
		this.ws.onclose = (event) => console.log(`${this.username} ferme ${this.username}:`, event.code, event.reason);
		
		this.ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				this.handleEvent(data);
			}
			catch (error) {
				console.error("Error JSON.parse onmessage:", error); }
		};
	}

	private setupClickEvents() {

		this.chatInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') this.sendChatMessage();
		});

		this.sendBtn.addEventListener('click', () => this.sendChatMessage());
		this.readyBtn.addEventListener('click', () => this.toggleReadyState());
		this.startBtn.addEventListener('click', () => this.startGame());
		this.leaveBtn.addEventListener('click', () => this.leaveRoom());
		this.homeBtn.addEventListener('click', () => this.goHome());
		this.increaseAiBtn.addEventListener('click', () => this.increase());
		this.decreaseAiBtn.addEventListener('click', () => this.decrease());
		this.gameTypeSelect.addEventListener('change', () => this.gameTypeChanged());
		this.maxPlayersSelect.addEventListener('change', () => this.maxPlayersChanged());
    
	}

	private handleEvent(data: any) {
		console.log(`room ws event : ${data.type}`)
		switch (data.type) {

			case 'room_update':
				this.roomData = data.room;
				this.updateUI();
				break;
			
			case 'chat_message':
				this.addChatMessage(data.username, data.content);
				break;

			case 'system_message':
				this.addSystemMessage(data.content);
				break;

			case 'game_starting':
				this.launchGamePage(data.gameType);
				break;

			case 'notLog':
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new Event('popstate'));
				this.ws.close();
				break;
			case 'error':
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new Event('popstate'));
				this.ws.close();
				break;
			default:
				console.warn(`Unknown event type received: ${data.type}`);
		}
	}

	private sendChatMessage() {
		const message = this.chatInput.value.trim();
		if (message && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({
				type: 'chat_message',
				content: message,
				token: this.token
			}));
			this.chatInput.value = '';
		}
	}

	private toggleReadyState() {
		this.ws.send(JSON.stringify({
			type: 'toggle_ready',
			token: this.token,
		 }));
	}
	
	private increase() {

		if (this.roomData?.users?.length && (this.roomData?.maxPlayers === this.roomData?.users?.length + this.roomData?.ai))
			return;
		this.ws.send(JSON.stringify({
			type: 'increase',
			token: this.token,
		 }));
	}

	private decrease() {

		if (this.roomData?.users?.length && this.roomData?.users?.length === 0)
			return;
		this.ws.send(JSON.stringify({
			type: 'decrease',
			token: this.token,
		 }));
	}

	private maxPlayersChanged() {
		this.ws.send(JSON.stringify({
			type: 'maxPlayer',
			players: this.maxPlayersSelect.value,
			token: this.token
		}));
	}

	private gameTypeChanged() {
		this.ws.send(JSON.stringify({
			type: 'game_type',
			name: this.gameTypeSelect.value,
			token: this.token,
		}))
	}

	private startGame() {
		this.ws.send(JSON.stringify({
			type: 'start_game',
			token: this.token,
		 }));
	}

	private leaveRoom() {
		this.ws.close();
		window.history.pushState({}, '', '/matchmaking');
		window.dispatchEvent(new Event('popstate'));
	}

	private goHome() {
		this.ws.close();
		window.history.pushState({}, '', '/main');
		window.dispatchEvent(new Event('popstate'));
	}

	private updateUI() {

		if (!this.roomData)
			return;

		this.roomNameEl.textContent = this.roomData.name;
		this.gameTypeEl.textContent = this.roomData.gameType;
		this.aiCountSpan.textContent = String(this.roomData.ai);
		this.playerCountEl.textContent = `${this.roomData.users.length}/${this.roomData.maxPlayers}`;

		this.playersContainer.innerHTML = '';
		this.roomData.users.forEach(user => {
			this.playersContainer.innerHTML += this.playerCard(user);
		});

		for (let i = this.roomData.ai; i > 0; --i) {
			this.playersContainer.innerHTML += this.aiCard(i);
		}

		for (let i = this.roomData.users.length + this.roomData.ai; i < this.roomData.maxPlayers; i++)
			this.playersContainer.innerHTML += '<div class="empty-slot">Waiting for player...</div>';

		const currentUser = this.roomData.users.find(u => u.username === this.username);

		if (currentUser?.isReady) {
			this.readyBtn.classList.add('active');
			this.readyBtn.innerHTML = '<i class="fas fa-times"></i> Not Ready';
		}
		else {
			this.readyBtn.classList.remove('active');
			this.readyBtn.innerHTML = '<i class="fas fa-check"></i> Ready';
		}

		const allReady = this.roomData.users.every(u => u.isReady);

		if (this.roomData.host === this.username) {

			this.startBtn.disabled = !allReady;

			this.roomSettings.classList.remove('hidden')
			this.getElement('gameActions').classList.remove('hidden');

			if (this.roomData.gameType === 'block') {
				this.getElement('ai-setting').style.display = 'none';
				this.maxPlayersSelect.innerHTML = `<label class="text-white/80">Max Players</label>
									<select class="setting-select" id="maxPlayersSelect">
										<option value="1">1</option>
										<option value="2">2</option>
									</select>`;
				this.maxPlayersSelect.value = String(this.roomData.maxPlayers);
			}
			else {
				this.getElement('ai-setting').style.display = 'pong';
				if (this.roomData.users.length + this.roomData.ai === this.roomData.maxPlayers)
					this.increaseAiBtn.disabled = true;
				else
					this.increaseAiBtn.disabled = false;
				if (this.roomData.ai === 0)
					this.decreaseAiBtn.disabled = true;
				else
					this.decreaseAiBtn.disabled = false;

				this.maxPlayersSelect.innerHTML = `<label class="text-white/80">Max Players</label>
									<select class="setting-select" id="maxPlayersSelect">
										<option value="1">1</option>
										<option value="2">2</option>
										<option value="3">3</option>
										<option value="4">4</option>
									</select>`;
				this.maxPlayersSelect.value = String(this.roomData.maxPlayers);
			}
			
		}

		// afficher dans le select seulement les options possibles

		if (allReady)
			this.gameStatusEl.innerHTML = `<span class="status-dot ready"></span><span class="text-white/80">Ready to start!</span>`;
		else
			this.gameStatusEl.innerHTML = `<span class="status-dot waiting"></span><span class="text-white/80">Waiting for players...</span>`;
	}

	private playerCard(user: User): string {
		const isHost = this.roomData?.host === user.username;
		const readyClass = user.isReady ? 'ready' : '';
		const hostClass = isHost ? 'host' : '';
		const avatarInitial = user.username.charAt(0).toUpperCase();

		return `
			<div class="player-card ${readyClass} ${hostClass}">
				<div class="player-avatar">${avatarInitial}</div>
				<div class="player-name">${sanitizeHtml(user.username)}</div>
				<div class="player-status">${user.isReady ? 'Ready' : 'Not Ready'}</div>
			</div>
		`;
	}

	private aiCard(i: number): string {

		let pp;
		if (i === 1)
			pp = "/api/uploads/frozen.png";
		else if (i === 2)
			pp = "/api/uploads/fetiche.png";
		else
			pp = "/api/uploads/droide.png";

		return `
			<div class="player-card ai">
				<img class="player-avatar-img" src="${pp}" alt="Avatar">
				<div class="player-name">AI</div>
				<div class="player-status">Automatique</div>
			</div>
		`;
	}

	private addChatMessage(username: string, message: string) {
		const chatContainer = this.getElement('chatMessages');
		const messageElement = document.createElement('div');
		messageElement.className = 'chat-message';
		const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		messageElement.innerHTML = `
			<div class="chat-message-author">${sanitizeHtml(username)}</div>
			<div class="chat-message-content">${sanitizeHtml(message)}</div>
			<div class="chat-message-time">${time}</div>
		`;
		chatContainer.appendChild(messageElement);
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}

	private addSystemMessage(message: string) {
		const chatContainer = this.getElement('chatMessages');
		const messageElement = document.createElement('div');
		messageElement.className = 'chat-message system';
		messageElement.innerHTML = `<div class="chat-message-content">${sanitizeHtml(message)}</div>`;
		chatContainer.appendChild(messageElement);
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}

	private launchGamePage(gameType: string) {

		this.addSystemMessage(`The game is about to start ${gameType}...`);
		setTimeout(() => {
			this.ws.send(JSON.stringify({
				type: 'disconnection',
				message: 'je launch une game',
				token: this.token
			}));
			// faire le new block ou pong avec info de la game dans le constructeur
			if (this.roomData?.host === this.username) {
				if (gameType === 'pong' && this.roomData.users.length > 2)
					window.history.pushState({}, '', `/multipong/${this.uuid}`);
				else if (gameType === 'pong')
					window.history.pushState({}, '', `/pong/${this.uuid}`);
				else if (gameType === 'block' && this.roomData.users.length === 1)
					window.history.pushState({}, '', `/block/${this.uuid}`);
				else if (gameType === 'block' && this.roomData.users.length == 2)
					window.history.pushState({}, '', `/block1v1/${this.uuid}`);
			}
			else
				window.history.pushState({}, '', `/main`);

			window.dispatchEvent(new Event('popstate'));
		}, 1800);
	}
}
