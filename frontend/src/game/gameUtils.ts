import { getAuthToken } from '../utils/auth';
import { sanitizeHtml } from '../utils/sanitizer';

export interface Game {
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

		const response = await fetch('/api/games', {
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

let userData = {
	username: 'Username',
	email: 'email@example.com',
	avatar: 'avatar.png',
	wins: 0,
	games: 0,
	rating: 0,
	preferred_language: 'en'
};

export async function fetchUsername() {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch('/api/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		});
	
		if (response.ok) {
			const result = await response.json();
			userData = {
				username: sanitizeHtml(result.user?.username) || 'Username',
				email: sanitizeHtml(result.user?.email) || 'email@example.com',
				avatar: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				wins: (result.stats?.wins) || 0,
				games: (result.stats?.games) || 0,
				rating: (result.stats?.rating) || 0,
				preferred_language: sanitizeHtml(result.user?.language) || 'en'
				
			};
			console.log(userData);
			return (userData.username);
		}
		else 
			console.error('Erreur lors de la récupération des données utilisateur');
	}
	catch (error) {
		console.error("Error rendering profile page:", error); }
}

export async function getGame(gameId: number) {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch(`/api/games/specific/${gameId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log("on a bien recup la game", result);
			return result.game
		}
		else 
			console.error("erreur specific getGame");
	}
	catch (error) {
		console.error("erreur specific getGame: ", error); }
}

export async function getUuid(gameId: number) {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch(`/api/games/specific/${gameId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log(`game ${gameId} : ${result.uuid}`, result);
			return result.uuid
		}
		else 
			console.error("error retrieve game uuid");
	}
	catch (error) {
		console.error("error retrieve game uuid: ", error); }
}