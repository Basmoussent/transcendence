import { Game, fetchUsername, getUuid, postGame } from '../../game/gameUtils'
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { Chat } from './liveChat'


export function renderChat() {

	setTimeout(async () => {
		try {
			const username = await fetchUsername();
			if (username !== undefined) {
				const render = new Chat(username);}
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
		Home
	</button>

	<div class="main-container">
		<!-- Panel de gauche - Liste des conversations -->
		<div class="conversations-panel">
			<div class="conversations-header">
				<h2>Messages</h2>
				<input type="text" class="search-bar" placeholder="Rechercher..." id="searchInput">
			</div>
			<div class="conversations-list" id="conversationsList">
				<!-- Les conversations seront ajoutées ici dynamiquement -->
			</div>
		</div>

		<!-- Panel central - Conversation active -->
		<div class="chat-panel">
			<div class="chat-header" id="chatHeader" style="display: none;">
				<div class="chat-header-avatar" id="chatAvatar">A</div>
					<div class="chat-header-info">
					<h3 id="chatName">Alice Martin</h3>
					<div class="chat-header-status">
						<span class="status-dot" id="statusDot"></span>
						<span id="statusText">En ligne</span>
					</div>
				</div>
			</div>
			
			<div class="chat-messages" id="chatMessages">
				<div class="empty-chat" id="emptyChat">
					<i class="fas fa-comments"></i>
					<h3>Sélectionnez une conversation</h3>
					<p>Choisissez une conversation pour commencer à discuter</p>
				</div>
			</div>
			
			<div class="message-input-container" id="messageInputContainer" style="display: none;">
				<textarea class="message-input" id="messageInput" placeholder="Tapez votre message..." rows="1"></textarea>
				<button class="send-btn" id="sendBtn">
					<i class="fas fa-paper-plane"></i>
				</button>
			</div>
		</div>
	</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
        }

        body {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		overflow: hidden;
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

        .main-container {
		display: flex;
		height: 100vh;
		padding: 20px;
		padding-top: 80px;
		gap: 20px;
        }

        /* Panel de gauche - Liste des conversations */
        .conversations-panel {
		width: 300px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 15px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		overflow: hidden;
        }

        .conversations-header {
		padding: 20px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .conversations-header h2 {
		color: white;
		font-size: 1.4em;
		margin-bottom: 15px;
        }

        .search-bar {
		width: 100%;
		padding: 10px 15px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 0.9em;
        }

        .search-bar::placeholder {
		color: rgba(255, 255, 255, 0.5);
        }

        .conversations-list {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
        }

        .conversation-item {
		padding: 15px;
		margin-bottom: 5px;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		border: 1px solid transparent;
		position: relative;
		overflow: hidden;
        }

        .conversation-item:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateX(5px);
        }

        .conversation-item.active {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
        }

        .conversation-item.unread::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: #10B981;
        }

        .conversation-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		margin-bottom: 8px;
        }

        .conversation-name {
		color: white;
		font-weight: bold;
		margin-bottom: 3px;
        }

        .conversation-preview {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.85em;
		margin-bottom: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
        }

        .conversation-time {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.75em;
        }

        .conversation-badge {
		position: absolute;
		top: 10px;
		right: 10px;
		background: #EF4444;
		color: white;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7em;
		font-weight: bold;
        }

        /* Panel central - Conversation active */
        .chat-panel {
		flex: 1;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 15px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		overflow: hidden;
        }

        .chat-header {
		padding: 20px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		gap: 15px;
        }

        .chat-header-avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: 1.2em;
        }

        .chat-header-info h3 {
		color: white;
		margin-bottom: 3px;
        }

        .chat-header-status {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9em;
		display: flex;
		align-items: center;
		gap: 5px;
        }

        .status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #10B981;
        }

        .status-dot.offline {
		background: #6B7280;
        }

        .chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 15px;
        }

        .message {
		max-width: 70%;
		padding: 12px 16px;
		border-radius: 15px;
		position: relative;
		animation: slideIn 0.3s ease;
        }

        .message.sent {
		align-self: flex-end;
		background: linear-gradient(135deg, #10B981 0%, #059669 100%);
		color: white;
        }

        .message.received {
		align-self: flex-start;
		background: rgba(255, 255, 255, 0.15);
		color: white;
        }

        .message-content {
		margin-bottom: 5px;
		line-height: 1.4;
        }

        .message-time {
		font-size: 0.75em;
		opacity: 0.7;
        }

        .message.sent .message-time {
		text-align: right;
        }

        .empty-chat {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.5);
		text-align: center;
        }

        .empty-chat i {
		font-size: 4em;
		margin-bottom: 20px;
        }

        .empty-chat h3 {
		margin-bottom: 10px;
		font-size: 1.5em;
        }

        /* Input de message */
        .message-input-container {
		padding: 20px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		gap: 15px;
		align-items: center;
        }

        .message-input {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 0.9em;
		resize: none;
		max-height: 100px;
        }

        .message-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
        }

        .send-btn {
		padding: 12px 16px;
		border: none;
		border-radius: 50%;
		background: linear-gradient(135deg, #10B981 0%, #059669 100%);
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
        }

        .send-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .send-btn:disabled {
		background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
		cursor: not-allowed;
		opacity: 0.5;
        }

        /* Scrollbar styling */
        .conversations-list::-webkit-scrollbar,
        .chat-messages::-webkit-scrollbar {
		width: 8px;
        }

        .conversations-list::-webkit-scrollbar-track,
        .chat-messages::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
        }

        .conversations-list::-webkit-scrollbar-thumb,
        .chat-messages::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .conversations-list::-webkit-scrollbar-thumb:hover,
        .chat-messages::-webkit-scrollbar-thumb:hover {
		background-color: rgba(255, 255, 255, 0.5);
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

        .conversations-panel, .chat-panel {
		animation: fadeIn 0.5s ease-out;
        }

	.chat-options {
		margin-left: auto;
		position: relative;
		cursor: pointer;
		color: white;
		font-size: 1.2em;
	}

	.chat-options i:hover {
		opacity: 0.8;
	}

	.friends-panel {
		position: absolute;
		top: 30px;
		right: 0;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		padding: 10px 15px;
		min-width: 150px;
		color: white;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.friends-panel h4 {
		margin-bottom: 10px;
		font-size: 1em;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding-bottom: 5px;
	}

	.friends-panel ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.friends-panel li {
		padding: 5px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.friends-panel li:last-child {
		border-bottom: none;
	}

	</style>
	`;
};

