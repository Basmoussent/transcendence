import { Available, loadAvailableGames, matchmaking,  } from "./matchmaking";
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';



	// <div class="flex gap-12 h-screen justify-center items-center px-8" id=options-container>
const getTemplate = () => {
	return `
	<div class="flex gap-12 h-screen justify-center items-center px-8" id="options-container">
		<button class="home-button" id="homeBtn">
			<i class="fas fa-home"></i>
			Home
		</button>

		<!-- Game Options Section -->
		<div class="glass-panel w-4/6 flex flex-col gap-10 justify-center items-center px-20 py-16 h-10/12">
			<div id="game-options" class="flex flex-col gap-8 justify-center items-center w-full">

				<div class="option-group">
					<button class="option-button pong-button" id="pongBtn">Pong</button>
					<button class="option-button block-button" id="blockBtn">Block</button>
				</div>

				<div class="option-group">
					<button class="option-button player-button" id="1playerBtn">1 player</button>
					<button class="option-button player-button" id="2playerBtn">2 player</button>
					<button class="option-button player-button" id="3playerBtn">3 player</button>
					<button class="option-button player-button" id="4playerBtn">4 player</button>
				</div>

				<div class="option-group">
					<button class="option-button launch-button" id="launchBtn">Launch</button>
					<button class="option-button reset-button" id="resetBtn">Reset</button>
				</div>
			</div>
		</div>

		<!-- Join Game Section -->
		<div class="glass-panel w-2/6 flex flex-col gap-5 justify-start items-center py-8 px-6 h-10/12">
			<h1 class="text-white text-2xl font-bold uppercase tracking-wider">Join a Game</h1>

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

	.option-group {
		display: flex;
		gap: 20px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		padding: 16px 24px;
		box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.1);
	}

	.option-button {
		padding: 12px 20px;
		font-size: 1.2em;
		border-radius: 12px;
		border: none;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.option-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
	}

	/* Button backgrounds */
	.pong-button {
		background: linear-gradient(135deg, #4a90e2, #8DA1B9);
	}
	.block-button {
		background: linear-gradient(135deg, #474973, #03254E);
	}
	.player-button {
		background: linear-gradient(135deg, #EF959C, #95ADB6);
	}
	.player-button-grise {
		background: linear-gradient(135deg, #E3E3E3, #5B5750);
		pointer-events: none;
		opacity: 0.32;
	}
	.launch-button {
		background: linear-gradient(135deg, #AFC97E, #5A8573);
	}
	.reset-button {
		background: linear-gradient(135deg, #89B0AE, #272635);
	}
	.chosen-button {
		background: linear-gradient(135deg, #474973, #7B0D1E);
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
		background: linear-gradient(135deg, #AFC97E, #5A8573);
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
		background: linear-gradient(135deg, #5A8573, #AFC97E);
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
	</style>
	`;
}

async function gamesToDiv(games:Available[]): Promise<string> {

	let tmp:string = '';

	for (const game of games) {

		tmp += game.divConverion();
	}

	console.log("available games div: ", tmp);
	return tmp;
}

export function renderMatchmaking() {

	setTimeout(async () => {
		console.log('Initializing matchmaking page');
		try {
			const gameList = await loadAvailableGames();

			if (gameList === -1) {
				return ;
			}
			const inject = await gamesToDiv(gameList);
			
			const container = document.getElementById('available-games');

			if (container && typeof inject === 'string') {
				container.innerHTML = inject;
			}
			const render = new matchmaking();
		}
		catch (err:any) {
			console.log(err);
		}
	}, 0);

	return getTemplate();

}


