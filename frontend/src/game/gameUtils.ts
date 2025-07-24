import { promises } from 'dns';
import { getAuthToken } from '../utils/auth';
import { sanitizeHtml } from '../utils/sanitizer';

export interface Game {
	id?: number,
	uuid?: string,
	game_type: string,
	player1: string,
	player2?: string,
	player3?: string,
	player4?: string,
	winner?: string,
	users_needed: number,
	start_time?: string,
	end_time?: string
}

export async function postGame(input: any): Promise<number> {
	
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
				game_type: input.game_type,
				player1: input.player1,
				users_needed: input.users_needed,
			})
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log("game cree: ", result);
			console.log("le post return ", result.uuid)
			return (result.uuid);
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

		const response = await fetch('/api/games/log', {
			method: 'POST',
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
			method: 'POST',
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

export async function logEndGameHistory(uuid: string, winner:string) {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch(`/api/games/finish/${uuid}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
			body: JSON.stringify({
				winner: winner,
			})
		});
	
		if (response.ok) {
			const result = await response.json();
			console.log("endgame bien log dans l'history", result);
		}
		else 
			console.error("Erreur lors de log une game pour history");
	}
	catch (error) {
		console.error("Error saving a game dans l'history: ", error); }
}

let userData = {
	username: 'Username',
	email: 'email@example.com',
	avatar: 'avatar.png',
	id: 0,
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
				id: result.user?.id || 0,
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

export async function fetchUserId() {
	
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
			return (result.user?.id || 0);
		}
		else 
			console.error('Erreur lors de la récupération des données utilisateur');
	}
	catch (error) {
		console.error("Error rendering profile page:", error); }
}

export async function getGame(gameId: number): Promise<Game | null> {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return null;
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
			const game: Game = {
				id: Number(result.id),
				uuid: sanitizeHtml(result.uuid),
				game_type: sanitizeHtml(result.game_type),
				player1: sanitizeHtml(result.player1),
				player2: sanitizeHtml(result?.player2),
				player3: sanitizeHtml(result?.player3),
				player4: sanitizeHtml(result?.player4),
				winner: sanitizeHtml(result?.winner),
				users_needed:(Number(result.users_needed)),
				start_time: sanitizeHtml(result?.start_time),
				end_time: sanitizeHtml(result?.end_time),
			};
			return game;
		}
		else 
			console.error("erreur specific getGame");
	}
	catch (error) {
		console.error("erreur specific getGame: ", error); }
	return null
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

		const response = await fetch(`/api/games/specific?gameId=${gameId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},

		});
	
		if (response.ok) {
			const result = await response.json();
			const uuid = result.game.uuid;
			console.log(`game ${gameId} : ${uuid}`);
			return uuid
		}
		else {
			console.error("error retrieve game uuid");
			return null;
		}

	}
	catch (error) {
		console.error("error retrieve game uuid: ", error); }
}

export async function getGameByUuid(uuid: string): Promise<number> {

	try {
		const response = await fetch(`api/games/room/?uuid=${uuid}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.ok) {
			const data = await response.json();

			console.log(`on return ${data.game.id}`);
			return (data.game.id);
		}
		else 
			console.error('Erreur lors de la récupération de la game')
		
	}
	catch (error) {
		console.error('Erreur réseau ou autre problème :', error); }
	return (-1);
}

export async function getUserGameHistory(username: string): Promise<Game[]> {
	
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return [];
		}

		const response = await fetch(`/api/games/user/${encodeURIComponent(username)}/history`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token,
			},
		});

		if (response.ok) {
			const result = await response.json();
			console.log("Historique des parties récupéré:", result);
			
			const games: Game[] = result.games.map((game: any) => ({
				id: Number(game.id),
				uuid: sanitizeHtml(game.uuid),
				game_type: sanitizeHtml(game.game_type),
				player1: sanitizeHtml(game.player1),
				player2: sanitizeHtml(game.player2),
				player3: sanitizeHtml(game.player3),
				player4: sanitizeHtml(game.player4),
				winner: sanitizeHtml(game.winner),
				users_needed: Number(game.users_needed),
				start_time: sanitizeHtml(game.start_time),
				end_time: sanitizeHtml(game.end_time),
			}));

			return games;
		}
		else {
			console.error("Erreur lors de la récupération de l'historique des parties");
			return [];
		}
	}
	catch (error) {
		console.error("Erreur getUserGameHistory:", error);
		return [];
	}
}
