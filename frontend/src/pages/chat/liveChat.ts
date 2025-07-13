import { escape } from 'querystring';
import { sanitizeHtml } from '../../utils/sanitizer';
import { fetchUserInfo, loadMe } from './utils';

export interface UserChat {
	username: string;
	userId: number;
	email: string;
	avatar_url: string;
	receiver?: string;
}

export class Chat {

	private username: string;
	private ws: WebSocket;

	// Left Panel
	private homeBtn: HTMLButtonElement;
	private searchInput: HTMLInputElement;
	private friendsList: HTMLElement;
	private requestsList: HTMLElement;
	private addFriendBtn: HTMLButtonElement;
	private friendUsernameInput: HTMLInputElement;
	private friendsCount: HTMLElement;
	private requestsCount: HTMLElement;
	private tabs: NodeListOf<HTMLElement>;

	// Right Panel
	private noChatSelected: HTMLElement;
	private chatContainer: HTMLElement;
	private chatHeader: HTMLElement;
	private chatMessages: HTMLElement;
	private chatInput: HTMLInputElement;
	private sendBtn: HTMLButtonElement;

	private me: UserChat;

	private receiver?: string;

	constructor() {

		this.loadMe();

		if (!this.me?.username)
			throw new Error(`mgl j'ai pas d'infos ou quoi`)

		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/chat`);

		// Left Panel Elements
		this.homeBtn = this.getElement('homeBtn') as HTMLButtonElement;
		this.searchInput = this.getElement('searchInput') as HTMLInputElement;
		this.friendsList = this.getElement('friendsList');
		this.requestsList = this.getElement('requestsList');
		this.addFriendBtn = this.getElement('addFriendBtn') as HTMLButtonElement;
		this.friendUsernameInput = this.getElement('friendUsernameInput') as HTMLInputElement;
		this.friendsCount = this.getElement('friendsCount');
		this.requestsCount = this.getElement('requestsCount');
		this.tabs = document.querySelectorAll('.tab');

		// Right Panel Elements
		this.noChatSelected = this.getElement('noChatSelected');
		this.chatContainer = this.getElement('chatContainer');
		this.chatHeader = this.getElement('chatHeader');
		this.chatMessages = this.getElement('chatMessages');
		this.chatInput = this.getElement('chatInput') as HTMLInputElement;
		this.sendBtn = this.getElement('sendBtn') as HTMLButtonElement;

		this.chatInput.focus();
		this.setupWsEvents();
		this.setupClickEvents();
	}

	private async loadMe() {
		await loadMe(this);
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private setupWsEvents() {

		this.ws.onopen = () => {
			console.log(`${this.me.username} est connecte au live chat`)
		};

		this.ws.onerror = (error) => {
			console.error(`${this.me.username} onerror live chat: ${error}`)
		};

		this.ws.onclose = (event) => {
			console.log(`${this.me.username} part du live chat: ${event.code} ${event.reason}`)
		};

		this.ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				this.handleEvent(data);
			}
			catch (error) {
				console.error("Error JSON.parse onmessage:", error);
			}
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
		this.chatInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				this.sendChatMessage();
			}
		});
		this.homeBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new Event('popstate'));
		});

		this.tabs.forEach(tab => {
			tab.addEventListener('click', () => {
				const tabName = tab.dataset.tab;
				if (!tabName) return;

				this.tabs.forEach(t => t.classList.remove('active'));
				tab.classList.add('active');

				document.querySelectorAll('.tab-pane').forEach(pane => {
					const htmlPane = pane as HTMLElement;
					if (htmlPane.id === `${tabName}Tab`) {
						htmlPane.classList.remove('hidden');
					} else {
						htmlPane.classList.add('hidden');
					}
				});
			});
		});

		this.addFriendBtn.addEventListener('click', () => this.sendFriendRequest());
	}

	private sendFriendRequest() {
		const friendUsername = this.friendUsernameInput.value.trim();
		if (friendUsername && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({
				type: 'friend_request',
				recipient: friendUsername
			}));
			this.friendUsernameInput.value = '';
			// Optionally, provide user feedback here
		}
	}

	private sendChatMessage() {
		const message = this.chatInput.value.trim();
		if (message && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({
				type: 'chat_message',
				dest: this.receiver,
				content: message
			}));
			this.chatInput.value = '';
		}
	}

	private addChatMessage(username: string, message: string) {
		this.noChatSelected.style.display = 'none';
		this.chatContainer.style.display = 'flex';
		this.chatContainer.classList.remove('hidden');

		const messageElement = document.createElement('div');
		const isSent = username === this.me.username;
		messageElement.className = `chat-message ${isSent ? 'sent' : 'received'}`;
		const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		messageElement.innerHTML = `
			<div class="chat-message-content">${sanitizeHtml(message)}</div>
			<div class="chat-message-time">${time}</div>
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
		this.friendsList.innerHTML = '';
		this.friendsCount.textContent = users.length.toString();
		users.forEach(user => {
			const conversationElement = document.createElement('div');
			conversationElement.className = 'friend-card online flex items-center';
			conversationElement.dataset.username = user.username;
			conversationElement.innerHTML = `
				<div class="friend-avatar">
                    ${user.username.charAt(0).toUpperCase()}
                    <div class="status-dot online"></div>
                </div>
                <div class="friend-info">
                    <div class="friend-name">${sanitizeHtml(user.username)}</div>
                    <div class="friend-status">En ligne</div>
                </div>
                <div class="friend-actions">
                    <button class="action-btn chat-btn">
                        <i class="fas fa-comment-dots"></i>
                    </button>
                </div>
			`;
			this.friendsList.appendChild(conversationElement);
			conversationElement.addEventListener('click', () => this.startChatWith(user));
		});
	}

	private startChatWith(user: UserChat) {
		
		this.receiver = user.username;
		this.noChatSelected.style.display = 'none';
		this.chatContainer.style.display = 'flex';
		this.chatContainer.classList.remove('hidden');

		this.chatHeader.innerHTML = `
		<div class="friend-avatar">
			${user.username.charAt(0).toUpperCase()}
			<div class="status-dot online"></div>
		</div>
		<div class="chat-header-info">
			<h3>${sanitizeHtml(user.username)}</h3>
			<p>En ligne</p>
		</div>
		<button class="close-chat-btn ml-auto">
			<i class="fas fa-times"></i>
		</button>
		`;

		this.chatMessages.innerHTML = '';

		this.ws.send(JSON.stringify({
		type: 'fetch_history',
		with_user: user.username
		}));
	}
}
