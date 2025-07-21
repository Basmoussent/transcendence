import { Game, fetchUsername, getUuid, postGame } from '../../game/gameUtils'
import { sanitizeHtml } from '../../utils/sanitizer';
import { Chat } from './liveChat'
import { t } from '../../utils/translations';
import './chat.css';


export function renderChat() {
	return getTemplate();
}

export function initializeChatEvents() {
	console.log('Initializing chat page events');
	try {
		const chat = new Chat();
		(window as any).chatInstance = chat; // Expose l'instance pour la console
	} catch (err: any) {
		console.log(`erreur initializeChatEvents ${err}`);
	}
}

const getTemplate = () => {
	return `
	<div class="chat-page">
	<button class="home-button" id="homeBtn">
	<i class="fas fa-home"></i>
	${t('chat.home' as any)}
	</button>

	<div class="chat-layout">
	<!-- Left Panel - Liste des amis -->
	<div class="chat-left-panel">
		<h1 class="chat-title">
		<i class="fas fa-users"></i>
		${t('chat.myFriends' as any)}
		</h1>

		<!-- Barre de recherche -->
		<div class="search-bar">
		<i class="fas fa-search search-icon"></i>
		<input type="text" class="search-input" id="searchInput" placeholder="${t('chat.searchFriend' as any)}">
		</div>

		<!-- Onglets -->
		<div class="tabs">
		<div class="tab active" data-tab="friends">
			<i class="fas fa-user-friends"></i>
			${t('chat.friends' as any)} (<span id="friendsCount">0</span>)
		</div>
		<div class="tab" data-tab="requests">
			<i class="fas fa-user-plus"></i>
			${t('chat.requests' as any)} (<span id="requestsCount">0</span>)
		</div>
		<div class="tab" data-tab="add">
			<i class="fas fa-plus"></i>
			${t('chat.add' as any)}
		</div>
		</div>

		<!-- Contenu des onglets -->
		<div class="tab-content">
		<!-- Liste des amis -->
		<div id="friendsTab" class="tab-pane active">
			<div class="friends-list" id="friendsList">
			<!-- Les amis seront ajoutés ici dynamiquement -->
			</div>
		</div>

		<!-- Demandes d'amis -->
		<div id="requestsTab" class="tab-pane hidden">
			<div class="friends-list" id="requestsList">
			<!-- Les demandes seront ajoutées ici dynamiquement -->
			</div>
		</div>

		<!-- Ajouter un ami -->
		<div id="addTab" class="tab-pane hidden">
			<div class="add-friend-form">
			<h3>${t('chat.addNewFriend' as any)}</h3>
			<input type="text" class="add-friend-input" id="friendUsernameInput" placeholder="${t('chat.username' as any)}">
			<button class="add-friend-btn" id="addFriendBtn">
				<i class="fas fa-plus"></i>
				${t('chat.sendRequest' as any)}
			</button>
			</div>
		</div>
		</div>
	</div>

	<!-- Right Panel - Chat -->
	<div class="chat-right-panel">
		<div id="noChatSelected" class="empty-state">
		<i class="fas fa-comments"></i>
		<h3>${t('chat.selectFriendToChat' as any)}</h3>
		</div>

		<div id="chatContainer" class="chat-container hidden">
		<!-- En-tête du chat -->
		<div class="chat-header" id="chatHeader">
			<!-- Sera rempli dynamiquement -->
		</div>

		<!-- Messages du chat -->
		<div class="chat-messages" id="chatMessages">
			<!-- Les messages seront ajoutés ici dynamiquement -->
		</div>

		<!-- Zone de saisie -->
		<div class="chat-input-container">
			<!-- Bouton d'invitation à un jeu -->
			<div class="invite-game-dropdown">
				<button class="invite-game-btn" id="inviteGameBtn" title="Inviter à un jeu">
					<i class="fas fa-gamepad"></i>
				</button>
				<div class="invite-game-menu" id="inviteGameMenu">
					<button class="invite-game-option" data-game="pong">Pong</button>
					<button class="invite-game-option" data-game="block">Block</button>
				</div>
			</div>
			<input type="text" class="chat-input" id="chatInput" placeholder="${t('chat.typeMessage' as any)}" maxlength="200">
			<button class="send-btn" id="sendBtn">
			<i class="fas fa-paper-plane"></i>
			</button>
		</div>
		</div>
	</div>
	</div>
	</div>
	`;
};