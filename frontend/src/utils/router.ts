import { renderHome, initializeHomeEvents } from '../pages/menu/main';
import { renderLogin, initializeLoginEvents } from '../pages/auth/login';
import { renderCreateAccount, initializeCreateAccountEvents } from '../pages/auth/create-account';
import { renderForgotPassword, initializeForgotPasswordEvents } from '../pages/auth/forgot-password';
import { renderMain, initializeMainEvents } from '../pages/menu/renderMain';
import { render404 } from '../components/404';
import { renderMe, initializeMeEvents } from '../pages/social/me';
import { renderMatchmaking, initializeMatchmakingEvents } from '../pages/matchmaking/renderMatchmaking';
import { renderTournaments, initializeTournamentEvents } from '../pages/game/tournament';
import { renderBlock, initializeBlockEvents } from '../pages/block/main';
import { renderBlock1v1, initializeBlock1v1Events } from '../pages/block/block1v1';
import { renderRoom, initializeRoomEvents } from '../pages/room/renderRoom';
import { renderChat, initializeChatEvents } from '../pages/chat/renderChat';
import { renderChangePassword, initializeChangePasswordEvents } from '../pages/auth/change-password';
import { renderEditProfil, initializeEditProfileEvents } from '../pages/social/edit-profil';
import { getAuthToken } from './auth';
import { clearTranslationCache } from './translations';

import { renderMultiPong, initializeMultiPongEvents } from '../pages/pong/multiplayer-pong';
import { renderPong, initializePongEvents } from '../pages/pong/pong';
import { initAlive } from './auth';
import { renderProfil } from '../pages/social/renderProfil';
import { render2FA, initialize2FAEvents } from '../pages/auth/activate-2fa';
import { render2FALogin } from '../pages/auth/2fa-login';

import { cleanEvents } from './eventManager';

export async function router() {

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
		initializeMainEvents();
		return;
	}

	console.log("path:", path);

	const renderView: { [key: string]: (uuid?: string) => Promise<string> | string } = {
		'/': () => renderHome(),
		'/login': () => renderLogin(),
		'/lang': async () => {
			const lastPath = localStorage.getItem('lastPath');
			if (lastPath && lastPath !== '/lang') {
				console.log('log', lastPath);
				setTimeout(() => {
					window.history.pushState({}, '', lastPath);
					router();
					localStorage.removeItem('lastPath');
				}, 100);
				return ''; // Aucun rendu immédiat, car redirection
			} else {
				console.log('log', lastPath);
				window.history.pushState({}, '', '/');
				return renderHome();
			}
		},
		'/create-account': () => renderCreateAccount(),
		'/forgot-password': () => renderForgotPassword(),
		'/main': () => renderMain(),
		'/me': async () => await renderMe(),
		'/profil': (uuid?: string) => renderProfil(uuid!),
		'/matchmaking': () => renderMatchmaking(),
		'/change-password': () => renderChangePassword(),
		'/edit-profil': () => renderEditProfil(),
		'/room': (uuid?: string) => uuid ? renderRoom(uuid) : '',
		'/chat': () => renderChat(),
		'/2fa': () => render2FA(),
		'/block': (uuid?: string) => renderBlock(uuid!),
		'/block1v1': (uuid?: string) => renderBlock1v1(uuid!),
		'/pong': (uuid?: string) => renderPong(uuid!),
		'/multipong': (uuid?: string) => renderMultiPong(uuid!),
		'/tournament': () => renderTournaments(),
	};

	let view = '';
	const render = renderView[path];


	view = render ? await render(uuid) : render404()
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
		
	}

	// Initialiser les événements après le rendu pour les pages qui en ont besoin
	const initEvents: { [key: string]: (uuid?: string) => void } = {
		'/': initializeHomeEvents,
		'/lang': initializeHomeEvents,
		'/login': initializeLoginEvents,
		'/create-account': initializeCreateAccountEvents,
		'/forgot-password': initializeForgotPasswordEvents,
		'/main': initializeMainEvents,
		'/me': initializeMeEvents,
		'/matchmaking': initializeMatchmakingEvents,
		'/change-password': initializeChangePasswordEvents,
		'/edit-profil': initializeEditProfileEvents,
		'/chat': initializeChatEvents,
		'/2fa': initialize2FAEvents,
		'/tournament': initializeTournamentEvents,
	};

	const initEventsUuid: { [key:string]: (uuid: string) => void } = {
		'/room': initializeRoomEvents,
		'/block': initializeBlockEvents,
		'/block1v1': initializeBlock1v1Events,
		'/pong': initializePongEvents,
		'/multipong': initializeMultiPongEvents,
	}

	setTimeout(() => {
		const init = initEvents[path];
		const initUuid = initEventsUuid[path];
		
		
		var el = document.getElementById('app'),
		elClone = el!.cloneNode(true);

		el!.parentNode!.replaceChild(elClone, el!);

		if (init)
			init();
		else {
			initUuid(uuid)
		}
	}, 0);
}



