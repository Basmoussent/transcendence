import { getAuthToken } from '../utils/auth';

interface Game {
	game_name: string,
	chef: string,
	player1: string,
	users_needed: number,
}

export async function postGame(input:Game): Promise<number> {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return -1;
		}

		const response = await fetch('/api/games', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
			body: JSON.stringify({
				game_name: input.game_name,
				chef: input.chef,
				player1: input.player1,
				users_needed: input.users_needed,
			})
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log("game launch, en attente d'autre joueurs", result);
			return (result.gameId);
		}
		else 
			console.error("Erreur lors de creer une game");
	}
	catch (error) {
		console.error("Error saving a game: ", error); }
	return -1;
}

export async function logStartGame(gameId:number): Promise<number> {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return -1;
		}

		const response = await fetch('games', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
			body: JSON.stringify({
				gameId: gameId,
				start_time: Date.now().toString(),
			})
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log("la game start", result);
			return (result.gameId);
		}
		else 
			console.error("Erreur pour start la game");
	}
	catch (error) {
		console.error("Error start game: ", error); }
	return -1;
}

export async function logEndGame(gameId: number, winner:string) {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch('http://localhost:8000/games', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
			body: JSON.stringify({
				gameId: gameId,
				winner: winner,
				end_time: Date.now().toString()
			})
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log("endgame bien log", result);
		}
		else 
			console.error("Erreur lors de log une game");
	}
	catch (error) {
		console.error("Error saving a game: ", error); }
}