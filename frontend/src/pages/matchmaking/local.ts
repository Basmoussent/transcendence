import { loadAvailableGames, matchmaking,  } from "./matchmaking";
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

const getTemplate = (name: string) => {
	return `
	<div class="flex gap-12 h-screen justify-center items-center px-8">
		<div class="bg-yellow-500/40 w-4/6 flex flex-col gap-8 justify-center items-center px-42 h-10/12">
			<div class="flex gap-6 border-2 rounded-xl px-8 py-4">
				<button class="bg-blue-300 hover:bg-blue:500 p-2">PONG</button>
				<button class="bg-blue-300 hover:bg-blue:500 p-2">BLOCK</button>
			</div>
			<div class="flex gap-6 border-2 rounded-xl px-8 py-4">
				<button class="bg-blue-300 hover:bg-blue:500 p-2">Joueur 1</button>
				<button class="bg-blue-300 hover:bg-blue:500 p-2">Joueur 2</button>
				<button class="bg-blue-300 hover:bg-blue:500 p-2">Joueur 3</button>
				<button class="bg-blue-300 hover:bg-blue:500 p-2">Joueur 4</button>
			</div>

			<div class="flex gap-6 border-2 rounded-xl px-8 py-4">
				<button class="bg-blue-300 hover:bg-blue:500 p-2">launch</button>
				<button class="bg-blue-300 hover:bg-blue:500 p-2">reset</button>
			</div>
		</div>
		<div class="bg-blue-500/40 w-2/6 flex flex-col gap-3 justify-start items-center pt-[2%] px-4 h-10/12">

			<h1 class="">Join a game</h1>

			<div class="bg-red-500/40 w-[95%] h-[83%] grid grid-cols-2 gap-4 justify-start items-start pt-[2%] px-6 overflow-y-scroll" id=available-games>
				<div class="bg-green-400 h-32">Test</div>
				<div class="bg-green-400 h-32">Test</div>
			</div>

		</div>
	</div>

		`;
}
	

export function renderMatchmaking() {



	setTimeout(async () => {
		console.log('Initializing game making page');
		try {
			const gameList = await loadAvailableGames();
			const container = document.getElementById('available-games');
			if (container && typeof gameList === 'string') {
				container.innerHTML = gameList;
			}
		}
		catch (err:any) {
			console.log(err);
		}
	}, 0);



	return getTemplate("Hello !");

}