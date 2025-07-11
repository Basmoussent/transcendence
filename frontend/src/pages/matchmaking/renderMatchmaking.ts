import { Available, loadAvailableGames, matchmaking,  } from "./matchmaking";
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';



	// <div class="flex gap-12 h-screen justify-center items-center px-8" id=options-container>
/*
const getTemplate = () => {
	return `
	<div class="flex gap-12 h-screen justify-center items-center px-8" id=options-container>
		<button class="home-button" id="homeBtn">
			<i class="fas fa-home"></i>
			Home
		</button>
		<div class="bg-yellow-500/40 w-4/6 flex flex-col gap-8 justify-center items-center px-42 h-10/12 options-container">
			<div id="game-options" class="flex flex-col gap-8 justify-center items-center">
				<div class="flex gap-6 border-2 rounded-xl px-8 py-4">
					<button class="p-2 button pong-button" id=pongBtn>Pong</button>
					<button class="p-2 button block-button" id=blockBtn>Block</button>
				</div>
				<div class="flex gap-6 border-2 rounded-xl px-8 py-4">
					<button class="p-2 button player-button" id="1playerBtn">1 player</button>
					<button class="p-2 button player-button" id="2playerBtn">2 player</button>
					<button class="p-2 button player-button" id="3playerBtn">3 player</button>
					<button class="p-2 button player-button" id="4playerBtn">4 player</button>
				</div>

				<div class="flex gap-6 border-2 rounded-xl px-8 py-4">
					<button class="p-2 button launch-button" id="launchBtn">Launch</button>
					<button class="p-2 button reset-button" id="resetBtn">Reset</button>
				</div>
			</div>
		</div>
		<div class="bg-blue-500/40 w-2/6 flex flex-col gap-3 justify-start items-center pt-[2%] px-4 h-10/12">

			<h1 class="">Join a game</h1>

			<div class="bg-red-500/40 w-[95%] h-[83%] grid grid-cols-2 gap-4 justify-start items-start pt-[2%] px-6 overflow-y-scroll" id=available-games>
			</div>

		</div>
	</div>

<style>

.options-container {
	background: rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(10px);
	border-radius: 20px;
	padding: 30px;
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
	border: 4px solid rgba(255, 255, 255, 0.18);
	animation: fadeIn 0.5s ease-out;
}

.home-button {
	position: absolute;
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
}

.home-button:hover {
	background: rgba(255, 255, 255, 0.2);
	transform: translateY(-2px);
}

.pong-button {
	background: linear-gradient(135deg, #4a90e2 0%, #8DA1B9 100%);
}

.block-button {
	background: linear-gradient(135deg, #474973 0%, #03254E 100%);
}

.chosen-button {
	background: linear-gradient(135deg, #474973 0%, #7B0D1E 100%);
}

.pong-button {
	background: linear-gradient(135deg, #4a90e2 0%, #8DA1B9 100%);
}

.player-button {
	background: linear-gradient(135deg, #EF959C 0%, #95ADB6 100%);
}

.player-button-grise {
	background: linear-gradient(135deg, #E3E3E3 0%, #5B5750 100%);
	pointer-events: none;
	opacity: 0.32
}

.launch-button {
	background: linear-gradient(135deg, #AFC97E 0%, #5A8573 100%);
}

.reset-button {
	background: linear-gradient(135deg, #89B0AE 0%, #272635 100%);
}

.button {
	font-size: 1.3em;
	border: none;
	border-radius: 10px;
	color: white;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: bold;
}
</style>

		`;
}
		*/

const getTemplate = () => {
	return `
	<div class="main-container" id="options-container">
		<div class="floating-particles"></div>
		<div class="floating-particles particle-2"></div>
		<div class="floating-particles particle-3"></div>
		
		<button class="home-button" id="homeBtn">
			<i class="fas fa-home"></i>
			<span>Home</span>
		</button>

		<div class="game-setup-panel">
			<div class="panel-header">
				<h2 class="panel-title">Game Configuration</h2>
				<div class="title-underline"></div>
			</div>
			
			<div id="game-options" class="options-grid">
				<div class="option-section">
					<h3 class="section-label">Game Type</h3>
					<div class="button-group">
						<button class="game-btn pong-button" id="pongBtn">
							<div class="btn-icon">🏓</div>
							<span>Pong</span>
						</button>
						<button class="game-btn block-button" id="blockBtn">
							<div class="btn-icon">🧱</div>
							<span>Block</span>
						</button>
					</div>
				</div>

				<div class="option-section">
					<h3 class="section-label">Players</h3>
					<div class="button-group players-grid">
						<button class="game-btn player-button" id="1playerBtn">
							<div class="btn-icon">👤</div>
							<span>1P</span>
						</button>
						<button class="game-btn player-button" id="2playerBtn">
							<div class="btn-icon">👥</div>
							<span>2P</span>
						</button>
						<button class="game-btn player-button" id="3playerBtn">
							<div class="btn-icon">👨‍👩‍👦</div>
							<span>3P</span>
						</button>
						<button class="game-btn player-button" id="4playerBtn">
							<div class="btn-icon">👨‍👩‍👧‍👦</div>
							<span>4P</span>
						</button>
					</div>
				</div>

				<div class="option-section">
					<h3 class="section-label">Actions</h3>
					<div class="button-group action-buttons">
						<button class="game-btn launch-button" id="launchBtn">
							<div class="btn-icon">🚀</div>
							<span>Launch Game</span>
						</button>
						<button class="game-btn reset-button" id="resetBtn">
							<div class="btn-icon">🔄</div>
							<span>Reset</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="matchmaking-panel">
			<div class="panel-header">
				<h2 class="panel-title">Join Active Games</h2>
				<div class="title-underline"></div>
			</div>
			
			<div class="games-container" id="available-games">
				<div class="no-games-message">
					<div class="loading-spinner"></div>
					<p>Searching for available games...</p>
				</div>
			</div>
		</div>
	</div>

	<style>
	@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');

	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.main-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b69 50%, #0f0f23 100%);
		position: relative;
		overflow: hidden;
		display: flex;
		gap: 2rem;
		padding: 2rem;
		font-family: 'Exo 2', sans-serif;
	}

	.main-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
		pointer-events: none;
	}

	.floating-particles {
		position: absolute;
		width: 6px;
		height: 6px;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 50%;
		animation: float 6s ease-in-out infinite;
	}

	.particle-2 {
		top: 20%;
		left: 70%;
		animation-delay: -2s;
		animation-duration: 8s;
	}

	.particle-3 {
		top: 70%;
		left: 20%;
		animation-delay: -4s;
		animation-duration: 7s;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		33% { transform: translateY(-20px) rotate(120deg); }
		66% { transform: translateY(20px) rotate(240deg); }
	}

	.home-button {
		position: absolute;
		top: 1.5rem;
		left: 1.5rem;
		z-index: 100;
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50px;
		color: white;
		font-family: 'Orbitron', monospace;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.home-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
	}

	.game-setup-panel {
		flex: 2;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 2rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideInLeft 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
	}

	.matchmaking-panel {
		flex: 1;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 2rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideInRight 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
	}

	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.panel-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.panel-title {
		font-family: 'Orbitron', monospace;
		font-size: 1.8rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
		margin-bottom: 0.5rem;
	}

	.title-underline {
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, #ff006e, #8338ec, #3a86ff);
		margin: 0 auto;
		border-radius: 2px;
		animation: glow 2s ease-in-out infinite alternate;
	}

	@keyframes glow {
		from { box-shadow: 0 0 5px rgba(255, 0, 110, 0.5); }
		to { box-shadow: 0 0 20px rgba(255, 0, 110, 0.8), 0 0 30px rgba(131, 56, 236, 0.5); }
	}

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.option-section {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		padding: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}

	.option-section:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-2px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.section-label {
		font-family: 'Orbitron', monospace;
		font-size: 1.1rem;
		font-weight: 600;
		color: #ffffff;
		margin-bottom: 1rem;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.players-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: space-around;
	}

	.game-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 1rem 1.5rem;
		color: white;
		font-family: 'Exo 2', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		min-width: 100px;
		position: relative;
		overflow: hidden;
	}

	.game-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.game-btn:hover::before {
		left: 100%;
	}

	.btn-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
	}

	.game-btn:hover {
		transform: translateY(-3px) scale(1.05);
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
	}

	.pong-button {
		background: linear-gradient(135deg, #4a90e2 0%, #8DA1B9 100%);
		border-color: #4a90e2;
	}

	.pong-button:hover {
		background: linear-gradient(135deg, #5ba0f2 0%, #9db1c9 100%);
		box-shadow: 0 15px 40px rgba(74, 144, 226, 0.4);
	}

	.block-button {
		background: linear-gradient(135deg, #474973 0%, #03254E 100%);
		border-color: #474973;
	}

	.block-button:hover {
		background: linear-gradient(135deg, #575983 0%, #13355E 100%);
		box-shadow: 0 15px 40px rgba(71, 73, 115, 0.4);
	}

	.player-button {
		background: linear-gradient(135deg, #EF959C 0%, #95ADB6 100%);
		border-color: #EF959C;
	}

	.player-button:hover {
		background: linear-gradient(135deg, #ffa5ac 0%, #a5bdc6 100%);
		box-shadow: 0 15px 40px rgba(239, 149, 156, 0.4);
	}

	.launch-button {
		background: linear-gradient(135deg, #AFC97E 0%, #5A8573 100%);
		border-color: #AFC97E;
	}

	.launch-button:hover {
		background: linear-gradient(135deg, #bfd98e 0%, #6a9583 100%);
		box-shadow: 0 15px 40px rgba(175, 201, 126, 0.4);
	}

	.reset-button {
		background: linear-gradient(135deg, #89B0AE 0%, #272635 100%);
		border-color: #89B0AE;
	}

	.reset-button:hover {
		background: linear-gradient(135deg, #99c0be 0%, #373645 100%);
		box-shadow: 0 15px 40px rgba(137, 176, 174, 0.4);
	}

	.chosen-button {
		background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
		border-color: #ff006e;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% { box-shadow: 0 0 0 0 rgba(255, 0, 110, 0.7); }
		70% { box-shadow: 0 0 0 10px rgba(255, 0, 110, 0); }
		100% { box-shadow: 0 0 0 0 rgba(255, 0, 110, 0); }
	}

	.player-button-grise {
		background: linear-gradient(135deg, #404040 0%, #2a2a2a 100%);
		border-color: #404040;
		pointer-events: none;
		opacity: 0.5;
	}

	.games-container {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		padding: 1.5rem;
		height: calc(100vh - 200px);
		overflow-y: auto;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.games-container::-webkit-scrollbar {
		width: 8px;
	}

	.games-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
	}

	.games-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 10px;
	}

	.games-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}

	.no-games-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 200px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1rem;
		text-align: center;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top: 4px solid #8338ec;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@media (max-width: 1024px) {
		.main-container {
			flex-direction: column;
			gap: 1rem;
			padding: 1rem;
		}
		
		.players-grid {
			grid-template-columns: repeat(4, 1fr);
		}
		
		.action-buttons {
			flex-direction: column;
			gap: 1rem;
		}
	}

	@media (max-width: 768px) {
		.button-group {
			flex-direction: column;
		}
		
		.players-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.panel-title {
			font-size: 1.4rem;
		}
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


