import { renderHome, initializeHomeEvents } from '../pages/menu/main';
import { renderLogin } from '../pages/auth/login';
import { renderCreateAccount } from '../pages/auth/create-account';
import { renderForgotPassword, initializeForgotPasswordEvents } from '../pages/auth/forgot-password';
import { renderMain } from '../pages/menu/renderMain';
import { render404 } from '../components/404';
import { renderMe } from '../pages/social/me';
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

import { renderMultiPong } from '../pages/pong/multiplayer-pong';
import { renderPong } from '../pages/pong/pong';
import { initAlive } from './auth';
import { renderProfil } from '../pages/social/renderProfil';
import { render2FA } from '../pages/auth/activate-2fa';
import { render2FALogin } from '../pages/auth/2fa-login';

export async function router() {
	// Clear translation cache to ensure fresh translations
	clearTranslationCache();
	
	let path = window.location.pathname;
	const app = document.getElementById('app');
	if (!app) return;

	const publicRoutes = ['/', '/lang','/login', '/create-account', '/forgot-password'];
	const token = getAuthToken();

	let uuid: string = '';

	
	if (path.startsWith('/multipong/') || path.startsWith('/pong/') || path.startsWith('/block/') || path.startsWith('/block1v1/') ||
			path.startsWith('/room/') || path.startsWith('/profil/')) {

		const it = path.indexOf('/', 1);

		uuid = path.substring(it + 1);
		path = path.substring(0, it);
	}

	if (!publicRoutes.includes(path) && !token) {
		window.history.pushState({}, '', '/login');
		app.innerHTML = renderLogin();
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
		const data = await response.json();
		console.log("api check response:", data);
		if (response.status === 401) {
			window.history.pushState({}, '', '/login');
			app.innerHTML = renderLogin();
			return;
		}
		else if (response.ok && data.temp) {
			console.log("jvais render2fa login")
			app.innerHTML = render2FALogin();
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
			view = renderHome();
			break;
		case '/lang':
			const lastPath = localStorage.getItem('lastPath');
			if (lastPath && lastPath !== '/lang') {
				console.log('log', lastPath)
				setTimeout(() => {
				window.history.pushState({}, '', lastPath);
				router();
				localStorage.removeItem('lastPath');
				}, 100);
			} else {
				console.log('log', lastPath)
				view = renderHome();
				window.history.pushState({}, '', '/');
			}
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
			view = renderMain();
			break;
		case '/me':
			view = await renderMe();
			break;
		case '/profil':
			view = await renderProfil(uuid);
			break;
		case '/matchmaking':
			view = renderMatchmaking();
			break;
		case '/change-password':
			view = renderChangePassword();
			break;
		case '/edit-profil':
			view = renderEditProfil();
			break;
		case '/room':
			if (!uuid)
				return ;
			view = renderRoom(uuid);
			break;
		case '/chat':
			view = renderChat();
			break;
		case '/2fa':
			view = render2FA();
			break;
		case '/block':
			view = renderBlock(uuid);
			break;
		case '/block1v1':
			view = renderBlock1v1(uuid);
			break;
		case '/pong':
			view = renderPong(uuid);
			break;
		case '/multipong':
			view = renderMultiPong(uuid);
			break;
		case '/tournament':
			view = renderTournaments();
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
			const data = await response.json();
			console.log("response:", data);
			if (response.ok && data.temp) {
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