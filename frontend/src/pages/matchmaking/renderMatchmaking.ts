import { matchmaking } from "./matchmaking";

export function renderMatchmaking() {

	setTimeout(async () => {
		new matchmaking();
	}, 0);
	return getTemplate();
}

const getTemplate = () => {
	const html =  `
	<div class="flex gap-12 h-screen justify-center items-center px-8" id="options-container">
		<button class="home-button" id="homeBtn">
			<i class="fas fa-home"></i>
			Home
		</button>

		<div class="glass-panel w-4/6 flex flex-col gap-10 justify-center items-center px-20 py-16 h-10/12">
			<div id="game-options" class="flex flex-col gap-8 justify-center items-center w-full">
				
				<div class="title-section">
					<h1 id="oui" class="main-title">Create a Game</h1>
					<p class="subtitle">Choose your game type and launch a room</p>
				</div>

				<div class="game-type-section">
					<h2 class="section-title">Game Type</h2>
					<div class="game-type-buttons">
						<button class="game-type-button pong-button" id="pongBtn">
							<i class="fas fa-table-tennis"></i>
							<span>Pong</span>
						</button>
						<button class="game-type-button block-button" id="blockBtn">
							<i class="fas fa-cubes"></i>
							<span>Block</span>
						</button>
					</div>
				</div>

				<div class="action-buttons">
					<button class="action-button launch-button" id="launchBtn">
						<i class="fas fa-rocket"></i>
						<span>Launch Room</span>
					</button>
				</div>
			</div>
		</div>

		<div class="glass-panel w-2/6 flex flex-col gap-5 justify-start items-center py-8 px-6 h-10/12">
			<div class="join-header">
				<h1 class="join-title">Join a Game</h1>
				<p class="join-subtitle">Available rooms</p>
			</div>

			<div class="available-games-container" id="available-games">
				<!-- Empty state -->
				<div class="empty-state" id="empty-state">
					<div class="empty-icon">
						<i class="fas fa-gamepad"></i>
					</div>
					<p class="empty-text">No active games</p>
					<p class="empty-subtext">Create a game to get started</p>
				</div>
			</div>
		</div>
	</div>

	<style>
	.glass-panel {
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(12px);
		border-radius: 20px;
		padding: 30px;
		box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
		border: 2px solid rgba(255, 255, 255, 0.2);
		animation: fadeIn 0.5s ease-out;
	}

	/* Title Section */
	.title-section {
		text-align: center;
		margin-bottom: 20px;
	}

	.main-title {
		color: white;
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 8px;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.subtitle {
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1rem;
		font-weight: 400;
	}

	#oui {
		font-size: clamp(2rem, 5vw, 4rem);
		font-weight: 800;
		color: #B49CB6;
		margin-bottom: 36px;
		text-align: center;
		text-transform: uppercase;
		position: relative;
		transition: all 0.3s ease;
		letter-spacing: 2px;
		text-shadow: 0 2px 6px #D5CAD6;
		cursor: default;
	}

	#oui::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		width: 190px;
		height: 4px;
		background: #D5CAD6;
		border-radius: 2px;
		transform: translateX(-50%);
		transition: width 0.3s ease;
	}

	#oui:hover {
		color: #B35857;
		transform: scale(1.05);
		text-shadow: 0 4px 12px #DC605E;
	}

	#oui:hover::after {
		width: 100px;
	}


	/* Game Type Section */
	.game-type-section {
		width: 100%;
		text-align: center;
	}

	.section-title {
		color: white;
		font-size: 1.3rem;
		font-weight: 600;
		margin-bottom: 20px;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.game-type-buttons {
		display: flex;
		gap: 30px;
		justify-content: center;
	}

	.game-type-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 30px 40px;
		font-size: 1.4em;
		border-radius: 16px;
		border: none;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
		min-width: 140px;
		position: relative;
		overflow: hidden;
	}

	.game-type-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.game-type-button:hover::before {
		left: 100%;
	}

	.game-type-button:hover {
		transform: translateY(-5px) scale(1.05);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
	}

	.game-type-button i {
		font-size: 2rem;
		margin-bottom: 8px;
	}

	/* Button backgrounds */
	.pong-button {
		background: linear-gradient(135deg, #4a90e2, #8DA1B9);
	}

	.block-button {
		background: linear-gradient(135deg, #474973, #03254E);
	}

	.chosen-button {
		background: linear-gradient(135deg, #474973, #7B0D1E);
		transform: scale(1.05);
		box-shadow: 0 8px 25px rgba(123, 13, 30, 0.4);
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		gap: 20px;
		justify-content: center;
		margin-top: 20px;
	}

	.action-button {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 16px 30px;
		font-size: 1.2em;
		border-radius: 12px;
		border: none;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}

	.action-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
	}

	#launchBtn {
		font-size: clamp(1rem, 2.5vw, 1.4rem); /* taille adaptative */
		padding: 14px 30px;
		letter-spacing: 1px;
		position: relative;
		overflow: hidden;
		transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
	}

	#launchBtn::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 4px;
		background: #DFD9E2;
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	#launchBtn:hover::after {
		width: 80%;
		opacity: 1
	}

	#launchBtn:hover {
		transform: scale(1.12);
		box-shadow: 0 15px 40px #C3ACCE;
		filter: brightness(1.2);
	}

	.home-button {
		position: absolute;
		top: 20px;
		left: 20px;
		padding: 12px 18px;
		font-size: 1.1em;
		border: none;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
	}

	.home-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	/* Join Section */
	.join-header {
		text-align: center;
		margin-bottom: 20px;
	}

	.join-title {
		color: white;
		font-size: 1.8rem;
		font-weight: 700;
		margin-bottom: 5px;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.join-subtitle {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.9rem;
		font-weight: 400;
	}

	/* Available Games Container */
	.available-games-container {
		width: 100%;
		height: 83%;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		padding: 20px;
		overflow-y: auto;
		box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.5);
		text-align: center;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.3;
	}

	.empty-text {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.empty-subtext {
		font-size: 0.9rem;
		opacity: 0.7;
	}

	/* Game Card Styles */
	.game-card {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.game-card:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.game-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #4a90e2, #AFC97E);
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.game-title {
		color: white;
		font-weight: 700;
		font-size: 1.1rem;
	}

	.game-status {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-waiting {
		background: rgba(255, 193, 7, 0.2);
		color: #ffc107;
		border: 1px solid rgba(255, 193, 7, 0.3);
	}

	.status-playing {
		background: rgba(40, 167, 69, 0.2);
		color: #28a745;
		border: 1px solid rgba(40, 167, 69, 0.3);
	}

	.status-full {
		background: rgba(220, 53, 69, 0.2);
		color: #dc3545;
		border: 1px solid rgba(220, 53, 69, 0.3);
	}

	.game-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9rem;
	}

	.game-type {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.game-type i {
		color: #4a90e2;
	}

	.player-count {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.player-count i {
		color: #AFC97E;
	}

	/* Players List */
	.players-list {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.85rem;
	}

	.players-list i {
		color: #AFC97E;
		opacity: 0.8;
	}

	/* Join Button */
	.join-button {
		width: 100%;
		margin-top: 12px;
		padding: 10px 16px;
		background: linear-gradient(135deg, #D5CAD6, #011C27);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 0.9rem;
	}

	.join-button:hover {

		background: linear-gradient(135deg, #ED6A5A, #392B58);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(175, 201, 126, 0.3);
	}

	.join-button:active {
		transform: translateY(0);
	}

	/* Disabled state for full games */
	.game-card.full {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.game-card.full:hover {
		transform: none;
		box-shadow: none;
	}

	/* Scrollbar Styling */
	.available-games-container::-webkit-scrollbar {
		width: 6px;
	}

	.available-games-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 3px;
	}

	.available-games-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.available-games-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Loading Indicator */
	.loading-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 20px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.loading-indicator i {
		color: #4a90e2;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	/* Animations */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	</style>
	`;
	return html;
}
