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

			<div class="bg-red-500/30 w-full h-[83%] grid grid-cols-2 gap-4 p-4 overflow-y-auto rounded-xl shadow-inner backdrop-blur-md border border-white/20" id="available-games">
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

			if (gameList !== -1) {
				const inject = await gamesToDiv(gameList);
			
				const container = document.getElementById('available-games');

				if (container && typeof inject === 'string')
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


