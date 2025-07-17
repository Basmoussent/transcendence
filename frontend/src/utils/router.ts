import { renderHome, initializeHomeEvents } from '../pages/menu/main';
import { renderLogin } from '../pages/auth/login';
import { renderCreateAccount } from '../pages/auth/create-account';
import { renderForgotPassword, initializeForgotPasswordEvents } from '../pages/auth/forgot-password';
import { renderMain } from '../pages/menu/renderMain';
import { render404 } from '../components/404';
import { renderSocial } from '../pages/social/social';
import { renderProfil } from '../pages/social/profil';
import { renderMultiplayer, initializeMultiplayerEvents } from '../pages/game/multiplayer';
import { renderMatchmaking } from '../pages/matchmaking/renderMatchmaking';
import { renderTournaments, initializeTournamentEvents } from '../pages/game/tournament';
import { renderBlock } from '../pages/block/main';
import { renderBlock1v1 } from '../pages/block/block1v1';
import { renderRoom } from '../pages/room/renderRoom';
import { renderChat } from '../pages/chat/renderChat';
import { renderChangePassword, initializeChangePasswordEvents } from '../pages/auth/change-password';
import { renderEditProfil, initializeEditProfileEvents } from '../pages/social/edit-profil';
import { getAuthToken } from './auth';
import { clearTranslationCache } from './translations';
import { getGame } from '@/game/gameUtils';
import { initializeMatchmakingEvents } from '../pages/matchmaking/renderMatchmaking';
import { renderMultiPong } from '../pages/pong/multiplayer-pong';
import { renderChooseGame } from '../pages/game/choose-game';
import { renderPong } from '../pages/pong/pong';
import { initAlive } from './auth';
import { renderFriends } from '../pages/social/friends';
import { renderTFA } from '../pages/auth/activate-2fa';

export async function router() {
	// Clear translation cache to ensure fresh translations
	clearTranslationCache();
	
	let path = window.location.pathname;
	const app = document.getElementById('app');
	if (!app) return;

	const publicRoutes = ['/', '/lang','/login', '/create-account', '/forgot-password', '/block', '/block1v1'];
	const token = getAuthToken();

	let uuid: string = '';

	if (path.startsWith('/room/') || path.startsWith('/user/')) {
		uuid = path.substring(6);
		path = path.startsWith('/room/') ? '/room' : '/user';
	}
	
	if (!publicRoutes.includes(path) && !token) {
		window.history.pushState({}, '', '/login');
		app.innerHTML = renderLogin();https://chatgpt.com/c/6877c557-906c-8013-bd68-e9fef37f7f71
		return;
	}
	if (!publicRoutes.includes(path) && token) {
		const response = await fetch('/api/auth/verify', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token || '',
			},
		});
		console.log("api check response:", response);
		if (response.status === 401) {
			window.history.pushState({}, '', '/login');
			app.innerHTML = renderLogin();
			return;
		}
	};

	if (path === '/login' && token) {
		window.history.pushState({}, '', '/main');
		app.innerHTML = renderMain();
		return;
	}

	let view = '';
	console.log("path:", path);
	switch (path) {
		case '/':
		case '/lang':
			view = renderHome();
			window.history.pushState({}, '', '/');
			break;
		case '/login':
			view = renderLogin();
			break;
		case '/create-account':
			view = renderCreateAccount();
			break;
		case '/forgot-password':
			view = renderForgotPassword();
			break;
		case '/main':
			console.log('je passe ici')
			view = renderMain();
			break;
		case '/friends':
			view = renderSocial();
			break;
		case '/profil':
			view = await renderProfil();
			break;
		case '/user':
			view = await renderFriends(uuid);
			break;
		case '/multiplayer':
			view = renderMultiplayer();
			break;
		case '/matchmaking':
			view = renderMatchmaking();
			break;
		case '/block':
			view = renderBlock();
			break;
		case '/block1v1':
			view = renderBlock1v1();
			break;
		case '/change-password':
			view = renderChangePassword();
			break;
		case '/edit-profil':
			view = renderEditProfil();
			break;
		case '/pong':
			view = renderPong();
			break;
		case '/room':
			if (!uuid)
				return ;
			view = renderRoom(uuid);
			break;
		case '/chat':
			view = renderChat();
			break;
		default:
			view = render404();
	}
	app.innerHTML = view;

	const tokenAuth = getAuthToken();
	if (tokenAuth) {
		try {
			const response = await fetch('/api/auth/verify', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': tokenAuth,
				},
			});
			console.log("response:", response);
			if (response.ok) {
				initAlive();
			}
		} catch (e) {
			console.error('Erreur lors de la vérification du token:', e);
		}
		// console.log("initAlive");
		// console.log(tokenAuth);
	}

	// Initialiser les événements après le rendu pour les pages qui en ont besoin
	setTimeout(() => {
		switch (path) {
			case '/':
				initializeHomeEvents();
				break;
			case '/lang':
				initializeHomeEvents();
				break;
			case '/forgot-password':
				initializeForgotPasswordEvents();
				break;
			case '/multiplayer':
				initializeMultiplayerEvents();
				break;
			case '/change-password':
				initializeChangePasswordEvents();
				break;
			case '/edit-profil':
				initializeEditProfileEvents();
				break;
		}
	}, 0);
}



// const routeRenderMap = {
// 	'/': () => renderHome(),
// 	'/lang': () => renderHome(),
// 	'/login': () => renderLogin(),
// 	'/create-account': () => renderCreateAccount(),
// 	'/forgot-password': () => renderForgotPassword(),
// 	'/main': () => renderMain(),
// 	'/friends': () => renderSocial(),
// 	'/profil': () => renderProfil(),
// 	'/multiplayer': () => renderMultiplayer(),
// 	'/matchmaking': () => renderMatchmaking(),
// 	'/block': () => renderBlock(),
// 	'/block1v1': () => renderBlock1v1(),
// 	'/change-password': () => renderChangePassword(),
// 	'/edit-profil': () => renderEditProfil(),
// 	'/pong': () => renderPong(),
// 	'/chat': () => renderChat()
// };