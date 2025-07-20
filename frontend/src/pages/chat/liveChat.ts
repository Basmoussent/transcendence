import { sanitizeHtml } from '../../utils/sanitizer';
import { fetchMe, fetchUserInfo, loadMe } from './utils';
import { getAuthToken } from '../../utils/auth';
import { t } from '../../utils/translations';

export interface UserChat {
	username: string;
	userId: number;
	email: string;
	avatar_url: string;
	receiver?: string;
}

interface Relation {
	id: number;
	user_1: string;
	user_2: string;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked';
}

export class Chat {

	private ws!: WebSocket;

	// Left Panel
	private homeBtn!: HTMLButtonElement;
	private searchInput!: HTMLInputElement;
	private friendsList!: HTMLElement;
	private requestsList!: HTMLElement;
	private addFriendBtn!: HTMLButtonElement;
	private friendUsernameInput!: HTMLInputElement;
	private friendsCount!: HTMLElement;
	private requestsCount!: HTMLElement;
	private tabs!: NodeListOf<HTMLElement>;


	// Right Panel
	private noChatSelected!: HTMLElement;
	private chatContainer!: HTMLElement;
	private chatHeader!: HTMLElement;
	private chatMessages!: HTMLElement;
	private chatInput!: HTMLInputElement;
	private sendBtn!: HTMLButtonElement;

	private me: UserChat = {
		username: "",
		email: "",
		avatar_url: "",
		userId: 0
	};

	private receiver?: string;
 
	constructor() {
		this.init();
	}

	private async init() {
		// Charger les données utilisateur d'abord
		await this.loadMe();

		// Créer le WebSocket seulement après avoir chargé les données
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
			this.updateUI();
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
				console.log(`les message ${data.content}`)
				this.addChatMessage(data.username, data.content);
				break;
			case 'friend_list_update':
				this.updateFriendAndRequest();
				break;
			case 'updateUI':
				this.updateUI();
				break;
			case 'system_message':
				this.addSystemMessage(data.content);
				this.updateFriendAndRequest();
				break;
			case 'debug':
				console.log(`DEBUG --> ${data.content}`)
				break;
			case 'notLog':
				console.log('pas de token pour livechat')
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new Event('popstate'));
				this.ws.close();
				break;
			default:
				console.log(`Unknown event type: ${data.type}   ${data.message}`);
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
					if (htmlPane.id === `${tabName}Tab`)
						htmlPane.classList.remove('hidden');
					else
						htmlPane.classList.add('hidden');
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
				dest: friendUsername
			}));
			this.friendUsernameInput.value = '';
			// Optionally, provide user feedback here
		}
	}

	private sendChatMessage() {
		const message = this.chatInput.value.trim();


		console.log("le message", message)
		if (message && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({
				type: 'chat_message',
				dest: this.receiver,
				content: message,
			}));
			// Affichage immédiat du message sur l'écran de l'utilisateur (optimistic UI)
			this.addChatMessage(this.me.username, message);
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

	private async updateFriendAndRequest() {

		var	friends = 0;
		var	request = 0;

		const relations: Relation[] | null = await fetchUserRelations(this.me.username);


		console.log(JSON.stringify(relations, null, 8))

		if (!relations || !relations.length) {
			console.log("t'as pas d'amis mgl")
			return;
		}

		this.friendsList.innerHTML = '';
		this.requestsList.innerHTML = '';

		for (const relation of relations) {
			console.log("relation", relation)

			const friendUsername = relation.user_1 === this.me.username ? relation.user_2 : relation.user_1;

			const friend: UserChat | void = await fetchUserInfo(friendUsername);

			if (!friend)
				continue;
			
			if (relation.user1_state === 'normal' && relation.user2_state === 'normal') {
				friends++;

				const conversationElement = document.createElement('div');
					conversationElement.className = 'friend-card online flex items-center';
					conversationElement.dataset.username = friend.username;
					conversationElement.innerHTML = `
						<div class="friend-avatar">
							${friend.username.charAt(0).toUpperCase()}
							<div class="status-dot online"></div>
						</div>
						<div class="friend-info">
							<div class="friend-name">${sanitizeHtml(friend.username)}</div>
							<div class="friend-status">${t('chat.online')}</div>
						</div>
						<div class="friend-actions">
							<button class="action-btn chat-btn">
								<i class="fas fa-comment-dots"></i>
							</button>
						</div>
					`;
				this.friendsList.appendChild(conversationElement);
				conversationElement.addEventListener('click', () => this.startChatWith(relation.id, friend));
			}
			else if ((relation.user_1 === this.me.username && relation.user2_state === 'waiting') ||
				(relation.user_2 === this.me.username && relation.user1_state === 'waiting')) {
				request++;


				console.log(`t'as une amis en attente zig`)

				const requestElement = document.createElement('div');
				requestElement.className = 'friend-card online flex items-center';
				requestElement.dataset.username = friend.username;
				requestElement.innerHTML = `
						<div class="friend-avatar">
							${friend.username.charAt(0).toUpperCase()}
							<div class="status-dot online"></div>
						</div>
						<div class="friend-info">
							<div class="friend-name">${sanitizeHtml(friend.username)}</div>
							<div class="friend-status">${t('chat.requests')}</div>
						</div>
						<div class="friend-actions">
							<button class="action-btn accept-btn">
							<i class="fas fa-check"></i>
							</button>
							<button class="action-btn deny-btn">
							<i class="fas fa-times"></i>
							</button>
						</div>
						`;
				this.requestsList.appendChild(requestElement);

				requestElement.querySelector('.accept-btn')?.addEventListener('click', () => {
					this.ws.send(JSON.stringify({ type: 'accept_friend_request', dest: friend.username }));
				});

				requestElement.querySelector('.deny-btn')?.addEventListener('click', () => {
					this.ws.send(JSON.stringify({ type: 'deny_friend_request', dest: friend.username }));
				});
			}

		}
		this.friendsCount.textContent = friends.toString();
		this.requestsCount.textContent = request.toString();
	}

	private updateUI() {
		this.updateFriendAndRequest()
	}

	private startChatWith(relationId: number, user: UserChat) {
		
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
			<p>${t('chat.online')}</p>
		</div>
		`;

		// Charger l'historique du chat
		this.loadChatHistoryFromAPI(user.username);
	}

	private async loadChatHistoryFromAPI(friendUsername: string) {
		try {
			const response = await fetch(`/api/friend/history?user1=${this.me.username}&user2=${friendUsername}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': getAuthToken() || ''
				}
			});

			if (response.ok) {
				const chatHistory = await response.json();
				this.chatMessages.innerHTML = ''; // Vider les messages actuels
				
				// Vérifier que chatHistory est un tableau
				if (Array.isArray(chatHistory)) {
					// Afficher l'historique des messages
					chatHistory.forEach((msg: any) => {
						this.addChatMessage(msg.sender_username, msg.content);
					});
				} else {
					console.error('L\'historique du chat n\'est pas un tableau:', chatHistory);
				}
			} else {
				console.error('Erreur lors du chargement de l\'historique du chat');
			}
		} catch (error) {
			console.error('Erreur lors du chargement de l\'historique du chat:', error);
		}
	}
}

async function fetchUserRelations(username: string): Promise<Relation[]|null> {

	try {
		const response = await fetch(`/api/friend/relations/?username=${username}`);
		
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.details || "Erreur inconnue");
		}

		const result = await response.json();

		if (response.ok)
			return result.relations;
		
		console.error("error retrieve relations of a user");
		return null;
	}
	catch (error: any) {
		console.error("error retrieve relations of a user", error.message);
	}
	return null;
}