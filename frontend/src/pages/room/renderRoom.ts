import { getAuthToken } from '../../utils/auth';
import { Room } from './room'
import { fetchUsername } from '../../game/gameUtils';

export function renderRoom(uuid: string) {

	setTimeout(async () => {
		try {

			const username = await fetchUsername();
			if (username !== undefined) {
				new Room(username, uuid);
			}
		}
		catch (err:any) {
			console.log(err);
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
		
		<div class="flex-1 flex gap-6 p-6 pt-20">
			<!-- Left Panel - Room Info -->
			<div class="w-1/3 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
				<div class="room-header mb-6">
					<h1 class="text-2xl font-bold text-white mb-2" id="roomName">Room Name</h1>
					<div class="flex items-center gap-4 text-white/80">
						<div class="flex items-center gap-2">
							<i class="fas fa-gamepad"></i>
							<span id="gameType">Pong</span>
						</div>
						<div class="flex items-center gap-2">
							<i class="fas fa-users"></i>
							<span id="playerCount">1/4</span>
						</div>
					</div>
				</div>
			
				<div class="room-controls mb-6">
					<button class="control-btn ready-btn" id="readyBtn">
						<i class="fas fa-check"></i>
						Ready
					</button>
					<button class="control-btn leave-btn" id="leaveBtn">
						<i class="fas fa-sign-out-alt"></i>
						Leave Room
					</button>
				</div>
			
				<div class="room-settings hidden" id="roomSettings">
					<h3 class="text-lg font-semibold text-white mb-3">Room Settings</h3>
					<div class="settings-grid">
						<div class="setting-item" id="max-player">
							<select class="setting-select" id="maxPlayersSelect">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
							</select>
						</div>
						<div class="setting-item">
							<label class="text-white/80">Game Type</label>
							<select class="setting-select" id="gameTypeSelect">
								<option value="pong">Pong</option>
								<option value="block">Block</option>
							</select>
						</div>
						<div class="setting-item" id="ai-setting">
							<label class="text-white/80 mb-2 block">AI</label>
							<div class="flex items-center gap-3">
								<button type="button" class="ai-button control-button" id="decreaseAI"
									class="px-3 py-1 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition">
									-
								</button>
								<span id="aiCount" class="text-white text-lg font-semibold w-6 text-center">0</span>
								<button type="button" class="ai-button control-button" id="increaseAI"
									class="px-3 py-1 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition">
									+
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Center Panel - Players -->
			<div class="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-bold text-white">Players</h2>
					<div class="status-indicator" id="gameStatus">
						<span class="status-dot waiting"></span>
						<span class="text-white/80">Waiting for players...</span>
					</div>
				</div>
			
				<div class="players-grid" id="playersContainer">
					<!-- Players will be dynamically added here -->
				</div>
				
				<div class="game-actions mt-6 hidden" id="gameActions">
					<button class="action-btn start-btn " id="startGameBtn" disabled>
						<i class="fas fa-play"></i>
						Start Game
					</button>
				</div>
			</div>
			
			<!-- Right Panel - Chat -->
			<div class="w-1/3 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg flex flex-col">
				<h2 class="text-xl font-bold text-white mb-4">Chat</h2>
			
				<div class="chat-messages flex-1 overflow-y-auto mb-4" id="chatMessages">
					<!-- Chat messages will be dynamically added here -->
				</div>
			
				<div class="chat-input-container">
					<input type="text" class="chat-input" id="chatInput" placeholder="Type a message..." maxlength="200">
					<button class="send-btn" id="sendBtn">
						<i class="fas fa-paper-plane"></i>
					</button>
				</div>
			</div>
		</div>
	

	<style>
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

	#chatMessages::-webkit-scrollbar {
		width: 8px;
	}

	#chatMessages::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05); /* arrière-plan discret */
		border-radius: 8px;
	}

	#chatMessages::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.3); /* poignée blanche translucide */
		border-radius: 8px;
		border: 2px solid rgba(255, 255, 255, 0.1); /* bord flouté */
	}

	#chatMessages::-webkit-scrollbar-thumb:hover {
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
		content: "HOST";
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

	.chat-messages {
		max-height: 400px;
		padding: 10px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.1);
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

	.room-header, .players-grid, .chat-messages {
		animation: fadeIn 0.5s ease-out;
	}
	</style>`;
};

