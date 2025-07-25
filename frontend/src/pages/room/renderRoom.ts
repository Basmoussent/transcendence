import { getAuthToken } from '../../utils/auth';
import { Room } from './room';
import { fetchUsername } from '../../game/gameUtils';
import { t } from '../../utils/translations';


export async function initializeRoomEvents(uuid: string) {
	console.log('Initializing room page events');
	try {
		const exists = await checkRoomExists(uuid);
		if (!exists) {
			showRoomError();
			return;
		}
		const username = await fetchUsername();
		if (username !== undefined) {
			console.log("je rentre ddans le if roon render");
			new Room(username, uuid);
		}
	} catch (err: any) {
		console.log(err);
	}
}

async function checkRoomExists(uuid: string): Promise<boolean> {
	try {
		const response = await fetch(`/api/games/room/existing/${uuid}`);
		if (!response.ok) return false;
		const data = await response.json();
		return data.room;
	} catch (err: any) {
		console.log('error:', err);
		return false;
	}
}

function showRoomError() {
	const appdiv = document.getElementById('app');
	if (appdiv) 
		appdiv.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;"><div style='font-size:3em;margin-bottom:20px;'>😢</div><div style='font-size:1.5em;font-weight:bold;margin-bottom:10px;'>Désolé, la room que vous cherchez n'existe plus.</div><button id='backHomeBtn' style='margin-top:20px;padding:12px 24px;background:#3B82F6;color:white;border-radius:8px;text-decoration:none;font-weight:bold;cursor:pointer;'>Retour à l'accueil</button></div>`;
	const btn = document.getElementById('backHomeBtn');
	if (btn) {
		btn.addEventListener('click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}
}

export function renderRoom() {
	return `
		<button class="home-button" id="homeBtn">
			<i class="fas fa-home"></i>
			${t('room.home')}
		</button>
		
		<div class="room-container">
			<!-- Left Panel - Room Info -->
			<div class="left-panel">
				<div class="room-header">
					<h1 class="room-title" id="roomName">${t('room.roomName')}</h1>
					<div class="room-info">
						<div class="room-info-item">
							<i class="fas fa-gamepad"></i>
							<span id="gameType">Pong</span>
						</div>
						<div class="room-info-item">
							<i class="fas fa-users"></i>
							<span id="playerCount">1/4</span>
						</div>
					</div>
				</div>
			
				<div class="room-controls">
					<button class="control-btn ready-btn" id="readyBtn">
						<i class="fas fa-check"></i>
						${t('room.ready')}
					</button>
					<button class="control-btn leave-btn" id="leaveBtn">
						<i class="fas fa-sign-out-alt"></i>
						${t('room.leaveRoom')}
					</button>
					
				</div>
			
				<div class="room-settings hidden" id="roomSettings">
					<h3 class="settings-title">${t('room.roomSettings')}</h3>
					<div class="settings-grid">
						<div class="setting-item" id="max-player">
							<label class="setting-label">${t('room.maxPlayers')}</label>
							<select class="setting-select" id="maxPlayersSelect">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
							</select>
						</div>
						<div class="setting-item">
							<label class="setting-label">${t('room.gameType')}</label>
							<select class="setting-select" id="gameTypeSelect">
								<option value="pong">Pong</option>
								<option value="block">Block</option>
							</select>
						</div>
						<div class="setting-item" id="ai-setting">
							<label class="setting-label ai-label">${t('room.ai')}</label>
							<div class="ai-controls">
								<button type="button" class="ai-button" id="decreaseAI">
									-
								</button>
								<span id="aiCount" class="ai-count">0</span>
								<button type="button" class="ai-button" id="increaseAI">
									+
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Center Panel - Players -->
			<div class="center-panel">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-bold text-white">${t('room.players')}</h2>
					<div class="status-indicator" id="gameStatus">
						<span class="status-dot waiting"></span>
						<span class="text-white/80">${t('room.waitingForPlayers')}</span>
					</div>
				</div>
			
				<div class="players-grid" id="playersContainer">
					<!-- Players will be dynamically added here -->
				</div>
				
				<div class="game-actions mt-6 hidden" id="gameActions">
					<button class="action-btn start-btn " id="startGameBtn" disabled>
						<i class="fas fa-play"></i>
						${t('room.startGame')}
					</button>
				</div>
			</div>
			
			<!-- Right Panel - Chat -->
			<div class="right-panel">
				<h2 class="text-xl font-bold text-white mb-4">${t('room.chat')}</h2>
			
				<div class="chat-messages-container" id="chatMessages">
					<!-- Chat messages will be dynamically added here -->
				</div>
			
				<div class="chat-input-container">
					<input type="text" class="chat-input" id="chatInput" placeholder="${t('room.typeMessage')}" maxlength="200">
					<button class="send-btn" id="sendBtn">
						<i class="fas fa-paper-plane"></i>
					</button>
				</div>
			</div>
		</div>
	

	<style>
	.room-container {
		display: flex;
		gap: 24px;
		padding: 24px;
		padding-top: 80px;
		min-height: 100vh;
		box-sizing: border-box;
	}

	.left-panel,
	.right-panel {
		width: 350px;
		min-width: 300px;
		max-width: 400px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(16px);
		border-radius: 12px;
		padding: 24px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		height: fit-content;
		max-height: calc(100vh - 120px);
		overflow-y: auto;
	}

	.center-panel {
		flex: 1;
		min-width: 0;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(16px);
		border-radius: 12px;
		padding: 24px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		height: fit-content;
		max-height: calc(100vh - 120px);
	}

	.right-panel {
		display: flex;
		flex-direction: column;
	}

	/* Responsivité pour tablettes */
	@media (max-width: 1200px) {
		.left-panel,
		.right-panel {
			width: 280px;
			min-width: 250px;
		}
		
		.room-container {
			gap: 16px;
			padding: 16px;
			padding-top: 70px;
		}
	}

	/* Responsivité pour écrans moyens */
	@media (max-width: 992px) {
		.room-container {
			flex-direction: column;
			gap: 20px;
			padding: 16px;
			padding-top: 70px;
		}

		.left-panel,
		.right-panel,
		.center-panel {
			width: 100%;
			max-width: none;
			min-width: 0;
			max-height: none;
		}

		.right-panel {
			order: 3;
		}

		.center-panel {
			order: 2;
		}

		.left-panel {
			order: 1;
		}

		.chat-messages-container {
			max-height: 300px;
		}
	}

	/* Responsivité pour mobiles */
	@media (max-width: 768px) {
		.room-container {
			padding: 12px;
			padding-top: 60px;
			gap: 16px;
		}

		.left-panel,
		.right-panel,
		.center-panel {
			padding: 16px;
			border-radius: 8px;
		}

		.home-button {
			top: 10px;
			left: 10px;
			padding: 8px 12px;
			font-size: 0.9em;
		}

		.players-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 15px;
		}

		.chat-messages-container {
			max-height: 250px;
		}
	}

	/* Responsivité pour très petits écrans */
	@media (max-width: 480px) {
		.room-container {
			padding: 8px;
			padding-top: 50px;
			gap: 12px;
		}

		.left-panel,
		.right-panel,
		.center-panel {
			padding: 12px;
		}

		.players-grid {
			grid-template-columns: 1fr;
			gap: 12px;
			min-height: 200px;
		}

		.player-card {
			padding: 15px;
		}

		.control-btn {
			padding: 10px;
			font-size: 0.9em;
		}

		.chat-input {
			padding: 10px;
			font-size: 0.9em;
		}

		.send-btn {
			padding: 10px 12px;
		}

		h1 {
			font-size: 1.5rem !important;
		}

		h2 {
			font-size: 1.25rem !important;
		}
	}

	.chat-messages-container {
		flex: 1;
		max-height: 400px;
		overflow-y: auto;
		margin-bottom: 16px;
		padding: 10px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Nouveaux styles pour les classes personnalisées */
	.room-header {
		margin-bottom: 24px;
	}

	.room-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
		margin-bottom: 8px;
	}

	.room-info {
		display: flex;
		align-items: center;
		gap: 16px;
		color: rgba(255, 255, 255, 0.8);
	}

	.room-info-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.room-controls {
		margin-bottom: 24px;
	}

	.settings-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		margin-bottom: 12px;
	}

	.setting-label {
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 4px;
		display: block;
	}

	.ai-label {
		margin-bottom: 8px;
	}

	.ai-controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.ai-count {
		color: white;
		font-size: 1.125rem;
		font-weight: 600;
		width: 24px;
		text-align: center;
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

	.chat-messages-container::-webkit-scrollbar {
		width: 8px;
	}

	.chat-messages-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05); /* arrière-plan discret */
		border-radius: 8px;
	}

	.chat-messages-container::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.3); /* poignée blanche translucide */
		border-radius: 8px;
		border: 2px solid rgba(255, 255, 255, 0.1); /* bord flouté */
	}

	.chat-messages-container::-webkit-scrollbar-thumb:hover {
		background-color: rgba(255, 255, 255, 0.5); /* effet hover */
	}

	.control-btn {
		width: 100%;
		padding: 12px;
		border: none;
		border-radius: 10px;
		font-size: 1em;
		font-weight: bold;
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 10px;
	}

	.ready-btn {
		background: linear-gradient(135deg, #10B981 0%, #059669 100%);
	}

	.ready-btn.active {
		background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
	}

	.ready-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
	}

	.leave-btn {
		background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
	}

	.leave-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(107, 114, 128, 0.3);
	}

	.invite-btn {
		background: linear-gradient(135deg, #1F487E 0%, #376996 100%);
        }

        .invite-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }

	.invite-section {
            margin-bottom: 24px;
        }

        .invite-label {
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 8px;
		font-weight: 500;
        }

        .invite-input-container {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
        }

        .invite-input {
		flex: 1;
		padding: 12px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 0.9em;
        }

        .invite-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
        }

	.ai-button {
		padding: 0.25rem 0.75rem;
		background-color: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		border-radius: 0.5rem;
		transition: all 0.2s ease-in-out;
	}

	.ai-button:hover {
		background-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
		box-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
		cursor: pointer
	}

	.settings-grid {
		display: grid;
		gap: 15px;
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.setting-select {
		padding: 8px 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 0.9em;
	}

	.setting-select option {
		background: #1F2937;
		color: white;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	.status-dot.waiting {
		background: #F59E0B;
	}

	.status-dot.ready {
		background: #10B981;
	}

	.status-dot.playing {
		background: #3B82F6;
	}

	.players-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
		min-height: 300px;
	}

	.player-card {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 15px;
		padding: 20px;
		text-align: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.player-card.ready {
		border-color: #10B981;
		background: rgba(16, 185, 129, 0.1);
	}

	.player-card.host {
		border-color: #F59E0B;
		background: rgba(245, 158, 11, 0.1);
	}

	.player-card.host::before {
		content: "${t('room.host')}";
		position: absolute;
		top: 5px;
		right: 5px;
		background: #F59E0B;
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.7em;
		font-weight: bold;
	}

	.player-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
	}

	.player-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		margin: 0 auto 10px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5em;
		color: white;
		font-weight: bold;
	}

	.player-name {
		color: white;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.player-status {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9em;
	}

	.empty-slot {
		background: rgba(255, 255, 255, 0.05);
		border: 2px dashed rgba(255, 255, 255, 0.2);
		border-radius: 15px;
		padding: 20px;
		text-align: center;
		color: rgba(255, 255, 255, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		font-style: italic;
	}

	.action-btn {
		padding: 15px 30px;
		border: none;
		border-radius: 10px;
		font-size: 1.1em;
		font-weight: bold;
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.start-btn {
		background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
	}

	.start-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
	}

	.start-btn:disabled {
		background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
		cursor: not-allowed;
		opacity: 0.5;
	}

	.chat-message {
		margin-bottom: 15px;
		padding: 10px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.1);
		animation: slideIn 0.3s ease;
	}

	.chat-message.system {
		background: rgba(59, 130, 246, 0.2);
		border-left: 3px solid #3B82F6;
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

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
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

	.room-header, .players-grid, .chat-messages-container {
		animation: fadeIn 0.5s ease-out;
	}
	</style>`;
};