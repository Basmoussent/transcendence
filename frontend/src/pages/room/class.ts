import { sanitizeHtml } from '../../utils/sanitizer';

export class Room {

	private ws: WebSocket;

	private homeBtn: HTMLButtonElement;
	private readyBtn: HTMLButtonElement;
	private startBtn: HTMLButtonElement;
	private leaveBtn: HTMLButtonElement;
	private sendBtn: HTMLButtonElement;

	// private settingsContainer: HTMLElement;
	// private chatContainer: HTMLElement;
	private input: HTMLInputElement;

	private username: string;

	constructor(uuid: number) {


		this.username = "espandju"

		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/room/${uuid}`);

		this.readyBtn = this.getElement('readyBtn') as HTMLButtonElement;
		this.startBtn = this.getElement('startGameBtn') as HTMLButtonElement;
		this.leaveBtn = this.getElement('leaveBtn') as HTMLButtonElement;
		this.sendBtn = this.getElement('sendBtn') as HTMLButtonElement;
		this.homeBtn = this.getElement('homeBtn') as HTMLButtonElement;
		this.leaveBtn = this.getElement('leaveBtn') as HTMLButtonElement;
		// this.settingsContainer = this.getElement('roomSettings');
		// this.chatContainer = this.getElement('chatMessages');
		this.input = this.getElement('chatInput') as HTMLInputElement ;

		this.setupEvents();

		this.ws.onopen = () => {
			this.addSystemMessage(`${this.username} just arrived`);
			console.log(`${this.username} vient de se connecter a la room ${uuid}`)
		}

		this.ws.onerror = (error) => {
			console.error(`❌ room ${uuid}\nWebSocket error:`, error)}

		this.ws.onclose = (event) => {
			this.addSystemMessage(`${this.username} just left`);
			console.log(`🔌 room ${uuid}\nConnection closed for ${this.username}:`, event.code, event.reason)}

		this.ws.onmessage = (event) =>  {
			const data = JSON.parse(event.data);
			this.handleEvents(data);}

	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private setupEvents() {

		this.input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter')
				this.sendMsg();
		});

		this.startBtn.addEventListener('click', () => this.startGame());
		this.readyBtn.addEventListener('click', () => this.beReady());
		this.sendBtn.addEventListener('click', () => this.sendMsg());
		this.homeBtn.addEventListener('click', () => this.leaveRoom());
		this.leaveBtn.addEventListener('click', () => this.leaveRoom());
	}

	private handleEvents(data: any) {


		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.log("le websocket n'est pas du tout ready l'ancien")
			return;
		}

		switch (data.type) {


			case 'chat_message':
				this.addSystemMessage(`${data.username}: ${data.content}`);
				break;

			case 'leave':
				this.updateRoomMembers(data);
				break;

			case 'player_joined':
				this.updateRoomMembers(data);
				break;
		}

	}

	// start la game
	private startGame() {
		console.log(`startGame appele`);
		this.ws.send(JSON.stringify({
			type: 'start',
		}));
	}

	// make myself ready
	private beReady() {

		if (this.ws.readyState !== WebSocket.OPEN) {
			console.warn("WebSocket not open yet.");
			return ;
		}


		console.log(`beReady appele`);

		this.ws.send(JSON.stringify({
			type: 'ready',
			content: this.username
		}));
	}

	// quitter la room
	private leaveRoom() {

		console.log(`leaveRoom appele`);

		this.ws.send(JSON.stringify({
			type: 'leave',
			content: this.username
		}));

		this.ws.close();
		window.history.pushState({}, '', '/matchmaking');
		window.dispatchEvent(new Event('popstate'));
	}

	// envoyer un msg dans le chat
	private sendMsg() {
		console.log(`sendMsg appele`);

		const message = this.input.value.trim();

		console.log(`msg = ${message}`)
	
		if (!message || !this.ws || this.ws.readyState !== WebSocket.OPEN)
			return;

		this.ws.send(JSON.stringify({
			type: 'chat_message',
			username: this.username,
			content: message
		}));
		this.input.value = '';
	}
	
	private addSystemMessage(message: string) {
		const chatContainer = document.getElementById('chatMessages');
		if (!chatContainer)
			return;

		const messageElement = document.createElement('div');
		messageElement.className = 'chat-message system';
		
		const time = new Date().toLocaleTimeString();
		
		messageElement.innerHTML = `
		<div class="chat-message-content">${sanitizeHtml(message)}</div>
		<div class="chat-message-time">${time}</div>
		`;
		
		chatContainer.appendChild(messageElement);
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}

	private updateRoomMembers(data: any) {
		if (data.type == 'leave') {
			console.log('faire des choses');
		}
		else if (data.typ == 'player_joined') {
			this.addSystemMessage(`${data.username} joined the room`);
		}
	}

	
}