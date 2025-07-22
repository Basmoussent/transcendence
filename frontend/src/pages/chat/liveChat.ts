import { sanitizeHtml } from '../../utils/sanitizer';
import { fetchMe, fetchUserInfo, loadMe } from './utils';
import { getAuthToken } from '../../utils/auth';
import { addEvent } from '../../utils/eventManager';
import { t } from '../../utils/translations';
import { postGame } from '../../game/gameUtils';

export interface UserChat {
	username: string;
	id: number;
	email: string;
	avatar_url: string;
	receiver?: string;
}

interface Relation {
	id: number;
	user_1: string;
	user_2: string;
	user1_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
	user2_state: 'normal' | 'requested' | 'waiting' | 'blocked' | 'angry';
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
		id: 0
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
		this.updateUI();
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
			console.log("non pite pas ca je veux plus je veux plus");
			// this.updateUI(); // s'appelle plusieurs fois trop bizarre
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
				if (typeof data.content === 'string' && data.content.startsWith('[INVITE_GAME:')) {
					const match = data.content.match(/^\[INVITE_GAME:([^:]+):([^\]]+)\]$/);
					if (match) {
						const gameType = match[1];
						const link = match[2];
						this.addGameInviteMessage(data.username, gameType, link);
						break;
					}
				}
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

		addEvent(this.sendBtn, 'click', () => this.sendChatMessage());
		addEvent(this.addFriendBtn, 'click', () => this.sendFriendRequest());

		addEvent(this.chatInput, 'keypress', (e: any) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				this.sendChatMessage();
			}
		});
		addEvent(this.homeBtn, 'click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new Event('popstate'));
		});

		window.addEventListener("load", (event) => {
			console.log("pro pro pro");
		});

		// Gestion du bouton d'invitation à un jeu
		const inviteBtn = document.getElementById('inviteGameBtn');
		const inviteMenu = document.getElementById('inviteGameMenu');
		if (inviteBtn && inviteMenu) {
			inviteBtn.addEventListener('mouseenter', () => {
				inviteMenu.style.display = 'block';
			});
			inviteBtn.addEventListener('mouseleave', () => {
				setTimeout(() => { if (!inviteMenu.matches(':hover')) inviteMenu.style.display = 'none'; }, 200);
			});
			inviteMenu.addEventListener('mouseleave', () => {
				inviteMenu.style.display = 'none';
			});
			inviteMenu.addEventListener('mouseenter', () => {
				inviteMenu.style.display = 'block';
			});
			inviteMenu.querySelectorAll('.invite-game-option').forEach(btn => {
				btn.addEventListener('click', async (e) => {
					const gameType = (e.target as HTMLElement).dataset.game;
					inviteMenu.style.display = 'none';
					await this.inviteToGame(gameType || 'pong');
				});
			});

		

		}

		this.tabs.forEach(tab => {
			addEvent(tab, 'click', () => {
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

	}

	private async sendFriendRequest() {

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

		const relations: Relation[] | null = await fetchUserRelations(this.me.id);

		console.log(JSON.stringify(relations, null, 8))

		if (!relations || !relations.length) {
			console.log("t'as pas d'amis mgl")
			return;
		}

		this.friendsList.innerHTML = '';
		this.requestsList.innerHTML = '';

		for (const relation of relations) {
			console.log("relation", relation)

			const friendid = relation.user_1 === this.me.id.toString() ? relation.user_2 : relation.user_1;

			const friend: UserChat | void = await fetchUserInfo(friendid);

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
							<div class="friend-status">${t('chat.online' as any)}</div>
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
			else if ((relation.user_1 == String(this.me.id) && relation.user2_state === 'waiting') ||
				(relation.user_2 == String(this.me.id) && relation.user1_state === 'waiting')) {
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
							<div class="friend-status">${t('chat.requests' as any)}</div>
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
					console.log("friend :", friend.username);
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

	private async playGame(game_type: string) {
		const game = {
			game_type: game_type,
			player1: this.me.username,
			users_needed: 2
		}
		const uuid = await postGame(game);
		window.history.pushState({}, '', `/room/${uuid}`);
		window.dispatchEvent(new PopStateEvent('popstate'));
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
			<p>${t('chat.online' as any)}</p>
		</div>
		`;

		// Charger l'historique du chat
		this.loadChatHistoryFromAPI(user.username);
	}

	private async loadChatHistoryFromAPI(friendUsername: string) {
		try {
			// TODO: protect sql injection
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
						if (typeof msg.content === 'string' && msg.content.startsWith('[INVITE_GAME:')) {
							const match = msg.content.match(/^\[INVITE_GAME:([^:]+):([^\]]+)\]$/);
							if (match) {
								const gameType = match[1];
								const link = match[2];
								this.addGameInviteMessage(msg.sender_username, gameType, link);
								return;
							}
						}
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

	private async inviteToGame(gameType: string) {
		if (!this.receiver) {
			alert('Sélectionnez un ami pour inviter à un jeu.');
			return;
		}
		const game = {
			game_type: gameType,
			player1: this.me.username,
			users_needed: 2
		};
		const uuid = await postGame(game);
		const link = `/room/${uuid}`;
		const inviteMsg = `[INVITE_GAME:${gameType}:${link}]`;
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({
				type: 'chat_message',
				dest: this.receiver,
				content: inviteMsg
			}));
			this.addGameInviteMessage(this.me.username, gameType, link);
			window.history.pushState({}, '', link);
			window.dispatchEvent(new PopStateEvent('popstate'));
		}
	}

	private async checkRoomExists(uuid: string): Promise<boolean> {
		try {
			const response = await fetch(`/api/games/room/existing/${uuid}`);
			if (!response.ok) return false;
			const data = await response.json();
			return !!data.exists;
		} catch {
			return false;
		}
	}

	// se baser sur l'id ?
	private addGameInviteMessage(username: string, gameType: string, link: string) {
		this.noChatSelected.style.display = 'none';
		this.chatContainer.style.display = 'flex';
		this.chatContainer.classList.remove('hidden');

		const messageElement = document.createElement('div');
		const isSent = username === this.me.username;
		messageElement.className = `chat-message ${isSent ? 'sent' : 'received'}`;
		const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		const gameLabel = gameType === 'pong' ? 'Pong' : 'Block';
		const gameIcon = gameType === 'pong'
			? '<span style="background:linear-gradient(135deg,#3B82F6,#10B981);border-radius:50%;padding:8px 10px;display:inline-block;"><i class="fas fa-table-tennis-paddle-ball" style="color:white;font-size:1.3em;"></i></span>'
			: '<span style="background:linear-gradient(135deg,#B5446E,#9D44B5);border-radius:50%;padding:8px 10px;display:inline-block;"><i class="fas fa-cube" style="color:white;font-size:1.3em;"></i></span>';
		const uuid = link.split('/').pop() || '';
		messageElement.innerHTML = `
			<div class="game-invite-card" style="display:flex;align-items:center;gap:16px;background:rgba(59,130,246,0.10);border-radius:14px;padding:16px 18px 14px 14px;box-shadow:0 2px 8px rgba(59,130,246,0.08);margin:4px 0;">
				${gameIcon}
				<div style="flex:1;">
					<div style="font-weight:bold;font-size:1.08em;color:#3B82F6;margin-bottom:2px;">Invitation à jouer à ${gameLabel}</div>
					<div style="color:#64748b;font-size:0.98em;margin-bottom:8px;">${isSent ? 'Tu as invité' : username + ' t\'a invité'} à rejoindre une partie.</div>
					<button class="game-invite-link" style="display:inline-block;padding:7px 18px;background:linear-gradient(135deg,#10B981,#3B82F6);color:white;border-radius:8px;font-weight:bold;text-decoration:none;transition:background 0.2s;box-shadow:0 2px 8px rgba(16,185,129,0.10);margin-top:2px;cursor:pointer;" data-uuid="${uuid}" data-link="${link}">Rejoindre la partie</button>
				</div>
			</div>
			<div class="chat-message-time" style="align-self:flex-end;">${time}</div>
		`;
		this.chatMessages.appendChild(messageElement);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

		// Ajout de l'event listener pour navigation SPA
		const joinBtn = messageElement.querySelector('.game-invite-link') as HTMLButtonElement;
		if (joinBtn) {
			joinBtn.addEventListener('click', async (e) => {
				e.preventDefault();
				const uuid = joinBtn.getAttribute('data-uuid') || '';
				const link = joinBtn.getAttribute('data-link') || '';
				console.log("uuid :", uuid, "link :", link)
				window.history.pushState({}, '', link);
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
		}
	}

	// Méthode globale pour gérer le clic sur le lien d'invitation
	public async handleInviteLinkClick(uuid: string, link: string) {
		const exists = await this.checkRoomExists(uuid);
			window.history.pushState({}, '', link);
			window.dispatchEvent(new PopStateEvent('popstate'));
	}
}

async function fetchUserRelations(userid: number): Promise<Relation[]|null> {

	try {
		const response = await fetch(`/api/friend/relations/?userid=${userid}`);
		
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