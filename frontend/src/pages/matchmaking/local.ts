import { matchmaking,  } from "./matchmaking";
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
		<div class="bg-blue-500/40 w-2/6 h-10/12"></div>
	</div>

		`;
}

	
const getAvailableGames = async () => {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch('/api/games/available', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		});
	
		if (response.ok) {
			const result = await response.json();
			return result.gameTables.map((game) => ({
				game_name: sanitizeHtml(game.game_name),
				chef: sanitizeHtml(game.chef),
				player1: sanitizeHtml(game.player_1),
				player2: sanitizeHtml(game.player_2),
				player3: sanitizeHtml(game.player_3),
				player4: sanitizeHtml(game.player_4),
			}));
		}
		else 
			console.error('Erreur lors de la récupération des données utilisateur');
	}
	catch (error) {
		console.error("Error rendering profile page:", error); }
	
}

export function renderMatchmaking() {



	setTimeout(async () => {
		console.log('Initializing game making page');
		try {
			const gameList = await getAvailableGames();
			console.log(gameList);

		}
		catch (err:any) {
			console.log(err);
		}
	}, 0);



	return getTemplate("Hello !");

}