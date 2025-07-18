import { Game, fetchUsername, getUuid, postGame } from '../../game/gameUtils'
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { Chat } from './liveChat'


export function renderChat() {

	setTimeout(async () => {
		try {
				const render = new Chat();
		}
		catch (err:any) {
			console.log(`erreur renderChat ${err}`);
		}
	}, 0);
	
	return getTemplate();
}

const getTemplate = () => {
	return `
	<button class="home-button" id="homeBtn">
	<i class="fas fa-home"></i>
	Accueil
	</button>

	<div class="flex-1 flex gap-6 p-6 pt-20">
	<!-- Left Panel - Liste des amis -->
	<div class="w-1/3 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
		<h1 class="text-2xl font-bold text-white mb-6">
		<i class="fas fa-users mr-2"></i>
		Mes Amis
		</h1>

		<!-- Barre de recherche -->
		<div class="search-bar">
		<i class="fas fa-search search-icon"></i>
		<input type="text" class="search-input" id="searchInput" placeholder="Rechercher un ami...">
		</div>

		<!-- Onglets -->
		<div class="tabs">
		<div class="tab active" data-tab="friends">
			<i class="fas fa-user-friends mr-2"></i>
			Amis (<span id="friendsCount">0</span>)
		</div>
		<div class="tab" data-tab="requests">
			<i class="fas fa-user-plus mr-2"></i>
			Demandes (<span id="requestsCount">0</span>)
		</div>
		<div class="tab" data-tab="add">
			<i class="fas fa-plus mr-2"></i>
			Ajouter
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
			<h3 class="text-white mb-4">Ajouter un nouvel ami</h3>
			<input type="text" class="add-friend-input" id="friendUsernameInput" placeholder="Nom d'utilisateur">
			<button class="add-friend-btn" id="addFriendBtn">
				<i class="fas fa-plus mr-2"></i>
				Envoyer une demande
			</button>
			</div>
		</div>
		</div>
	</div>

	<!-- Right Panel - Chat -->
	<div class="w-2/3 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg flex flex-col">
		<div id="noChatSelected" class="empty-state">
		<i class="fas fa-comments"></i>
		<h3>Sélectionnez un ami pour commencer à chatter</h3>
		</div>

		<div id="chatContainer" class="chat-container hidden">
		<!-- En-tête du chat -->
		<div class="chat-header" id="chatHeader">
			<!-- Sera rempli dynamiquement -->
		</div>

		<!-- Messages du chat -->
		<div class="chat-messages flex-1" id="chatMessages">
			<!-- Les messages seront ajoutés ici dynamiquement -->
		</div>

		<!-- Zone de saisie -->
		<div class="chat-input-container">
			<input type="text" class="chat-input" id="chatInput" placeholder="Tapez votre message..." maxlength="200">
			<button class="send-btn" id="sendBtn">
			<i class="fas fa-paper-plane"></i>
			</button>
		</div>
		</div>
	</div>
	</div>

<style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
        }

        .home-button {
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 10px 15px;
            font-size: 1em;
            border: none;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 100;
        }

        .home-button:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .search-bar {
            position: relative;
            margin-bottom: 20px;
        }

        .search-input {
            width: 100%;
            padding: 12px 15px 12px 45px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 0.9em;
            backdrop-filter: blur(10px);
        }

        .search-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.5);
        }

        .friend-card {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .friend-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .friend-card.online {
            border-color: #10B981;
            background: rgba(16, 185, 129, 0.1);
        }

        .friend-card.away {
            border-color: #F59E0B;
            background: rgba(245, 158, 11, 0.1);
        }

        .friend-card.offline {
            border-color: #6B7280;
            background: rgba(107, 114, 128, 0.1);
        }

        .friend-card.selected {
            border-color: #3B82F6;
            background: rgba(59, 130, 246, 0.2);
        }

        .friend-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2em;
            color: white;
            font-weight: bold;
            position: relative;
        }

        .status-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
        }

        .status-dot.online { background: #10B981; }
        .status-dot.away { background: #F59E0B; }
        .status-dot.offline { background: #6B7280; }

        .friend-info {
            flex: 1;
            margin-left: 15px;
        }

        .friend-name {
            color: white;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .friend-status {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9em;
        }

        .friend-actions {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .action-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 8px;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .chat-btn {
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            color: white;
        }

        .chat-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .remove-btn {
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            color: white;
        }

        .remove-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .accept-btn {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
        }

        .accept-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .deny-btn {
            background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
            color: white;
        }

        .deny-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }

        .tabs {
            display: flex;
            margin-bottom: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 5px;
        }

        .tab {
            flex: 1;
            padding: 10px;
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .tab.active {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .tab:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .add-friend-form {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }

        .add-friend-input {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            margin-bottom: 15px;
        }

        .add-friend-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .add-friend-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .add-friend-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .chat-messages {
            max-height: 400px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow-y: auto;
        }

        .chat-messages::-webkit-scrollbar {
            width: 8px;
        }

        .chat-messages::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.5);
        }

        .chat-message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            animation: slideIn 0.3s ease;
        }

        .chat-message.sent {
            background: rgba(59, 130, 246, 0.2);
            border-left: 3px solid #3B82F6;
            margin-left: 20px;
        }

        .chat-message.received {
            background: rgba(16, 185, 129, 0.2);
            border-left: 3px solid #10B981;
            margin-right: 20px;
        }

        .chat-message-author {
            font-weight: bold;
            color: #60A5FA;
            margin-bottom: 5px;
        }

        .chat-message-content {
            color: white;
        }

        .chat-message-time {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.8em;
            margin-top: 5px;
        }

        .chat-input-container {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .chat-input {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 0.9em;
        }

        .chat-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .send-btn {
            padding: 12px 15px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .send-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .empty-state {
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            padding: 40px;
        }

        .empty-state i {
            font-size: 3em;
            margin-bottom: 20px;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .friends-list, .chat-container {
            animation: fadeIn 0.5s ease-out;
        }

        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #EF4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: bold;
        }

        .chat-header {
            display: flex;
            align-items: center;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .chat-header .friend-avatar {
            width: 40px;
            height: 40px;
            margin-right: 15px;
        }

        .chat-header-info h3 {
            color: white;
            margin: 0;
            font-size: 1.1em;
        }

        .chat-header-info p {
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
            font-size: 0.9em;
        }

        .close-chat-btn {
            margin-left: auto;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            padding: 8px 10px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .close-chat-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .flex {
            display: flex;
        }

        .items-center {
            align-items: center;
        }
    </style>
	`;
};

