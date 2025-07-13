import { sanitizeHtml } from '../../utils/sanitizer';

interface UserChat {
	username: string;
	userId: number;
	email: string;
	avatar_url: string;
	receiver: string; 
}

export class Chat {

	private username: string;
	private ws: WebSocket;

	private homeBtn: HTMLButtonElement;
	private searchInput: HTMLInputElement;
	private conversationsList: HTMLElement;
	private chatHeader: HTMLElement;
	private chatAvatar: HTMLElement;
	private chatName: HTMLElement;
	private statusDot: HTMLElement;
	private statusText: HTMLElement;
	private chatMessages: HTMLElement;
	private emptyChat: HTMLElement;
	private messageInputContainer: HTMLElement;
	private messageInput: HTMLInputElement;
	private sendBtn: HTMLButtonElement;
	private receiver?: string; // le chat actuel de la personne
				// donc si un msg est envoyé de ce user ce sera à destination de receiver


	constructor(username: string) {

		this.username = username

		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/chat`);

		this.homeBtn = this.getElement('homeBtn') as HTMLButtonElement;
		this.searchInput = this.getElement('searchInput') as HTMLInputElement;
		this.conversationsList = this.getElement('conversationsList');
		this.chatHeader = this.getElement('chatHeader');
		this.chatAvatar = this.getElement('chatAvatar');
		this.chatName = this.getElement('chatName');
		this.statusDot = this.getElement('statusDot');
		this.statusText = this.getElement('statusText');
		this.chatMessages = this.getElement('chatMessages');
		this.emptyChat = this.getElement('emptyChat');
		this.messageInputContainer = this.getElement('messageInputContainer');
		this.messageInput = this.getElement('messageInput') as HTMLInputElement;
		this.sendBtn = this.getElement('sendBtn') as HTMLButtonElement;

		this.messageInput.focus();
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
			console.log(`${this.username} est connecte au live chat`)};

		this.ws.onerror = (error) => {
			console.error(`${this.username} onerror live chat: ${error}`)};

		this.ws.onclose = (event) => {
			console.log(`${this.username} part du live chat: ${event.code} ${event.reason}`)};
		
		this.ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				this.handleEvent(data);
			}
			catch (error) {
				console.error("Error JSON.parse onmessage:", error); }
		};
	}

	private handleEvent(data: any) {
		console.log(`live chat ws event : ${data.type}`)
		switch (data.type) {
			case 'chat_message':
				this.addChatMessage(data.username, data.content);
				break;
			case 'friend_list_update':
				this.updateFriendList(data.users);
				break;
			case 'system_message':
				this.addSystemMessage(data.content);
				break;
			default:
				console.log(`Unknown event type: ${data.type}`);
		}
	}

	private setupClickEvents() {
		this.sendBtn.addEventListener('click', () => this.sendChatMessage());
		this.messageInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				this.sendChatMessage();
			}
		});
		this.homeBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new Event('popstate'));
		});
	}

	private sendChatMessage() {
		const message = this.messageInput.value.trim();
		if (message && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({
				type: 'chat_message',
				dest: this.receiver,
				content: message
			}));
			this.messageInput.value = '';
		}
	}

	private addChatMessage(username: string, message: string) {
		this.emptyChat.style.display = 'none';
		const messageElement = document.createElement('div');
		const isSent = username === this.username;
		messageElement.className = isSent ? 'message sent' : 'message received';
		const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		messageElement.innerHTML = `
			<div class="message-content">${sanitizeHtml(message)}</div>
			<div class="message-time">${time}</div>
		`;
		this.chatMessages.appendChild(messageElement);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	private addSystemMessage(message: string) {
		const messageElement = document.createElement('div');
		messageElement.className = 'chat-message system';
		messageElement.innerHTML = `<div class="chat-message-content">${sanitizeHtml(message)}</div>`;
		this.chatMessages.appendChild(messageElement);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	private updateFriendList(users: UserChat[]) {

		this.conversationsList.innerHTML = '';
		users.forEach(user => {
			const conversationElement = document.createElement('div');
			conversationElement.className = 'conversation-item';
			conversationElement.innerHTML = `
				<div class="conversation-avatar">${user.username.charAt(0).toUpperCase()}</div>
				<div class="conversation-name">${sanitizeHtml(user.username)}</div>
				<div class="conversation-preview">En ligne</div>
			`;
			this.conversationsList.appendChild(conversationElement);
		});
	}
}
