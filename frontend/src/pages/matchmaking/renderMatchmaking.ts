import { Available, loadAvailableGames, matchmaking,  } from "./matchmaking";
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

	// <div class="flex gap-12 h-screen justify-center items-center px-8" id=options-container>
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


