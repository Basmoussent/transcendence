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
import { initAlive } from './auth';
import { renderProfil, initializeProfilEvents, cleanupProfilInstance } from '../pages/social/renderProfil';
import { render2FA, initialize2FAEvents } from '../pages/auth/activate-2fa';
import { render2FALogin } from '../pages/auth/2fa-login';

export async function router() {

	clearTranslationCache();
	
	let path = window.location.pathname;
	const app = document.getElementById('app');
	if (!app) return;

	const publicRoutes = ['/', '/login', '/create-account', '/forgot-password'];
	const token = getAuthToken();

	//TODO recuperer le username grace au token 
	console.log("je rnetre dans le routeur avec le path : ", path);

	let uuid: string = '';
	
	if (path.startsWith('/multipong') || path.startsWith('/block') || path.startsWith('/block1v1') ||
		path.startsWith('/room') || path.startsWith('/profil')) {

		const it = path.indexOf('/', 1);


		uuid = path.substring(it + 1);
		path = path.substring(0, it);

		if (!uuid) {
			console.error("pblm ya pas le uuid ou bien le username pour une page qui en a besoin")
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return;
		}

		if (path.startsWith('/profil')) {

			const profiluser = await userExists(uuid, token);

			if (profiluser == null) {
				window.history.pushState({}, '', '/main');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return; 
			}

			const me = await fetchMe(token);

			if (me.username == profiluser.username) {
				window.history.pushState({}, '', '/me');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return; 
			}

			const blocked = await checkThatImNotBlocked(me.id, profiluser.id, token);

			if (blocked) {
				window.history.pushState({}, '', '/main');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return; 
			}

			

			/// pas pouvoir aller sur le profil des gens qui nous bloquent
		}
		else {

			const flag = await gameExists(uuid, token);

			if (!flag) {
				window.history.pushState({}, '', '/main');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return; 
			}
		}

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
		'/multipong': async (uuid?: string) => await renderMultiPong(uuid!) || '',
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

		'/profil': initializeProfilEvents,
		'/room': initializeRoomEvents,
		'/block': initializeBlockEvents,
		'/block1v1': initializeBlock1v1Events,
		'/multipong': initializeMultiPongEvents,
	}

	setTimeout(() => {
		const init = initEvents[path];
		const initUuid = initEventsUuid[path];
		
		// Nettoyer les instances spécifiques avant de changer de page
		if (path !== '/profil') {
			cleanupProfilInstance();
		}

		var el = document.getElementById('app'),
		elClone = el!.cloneNode(true);

		el!.parentNode!.replaceChild(elClone, el!);

		if (init)
			init();
		else if (initUuid){
			initUuid(uuid)
		}
	}, 0);
}



async function userExists(username: string, token: any) {

	try {
		const response = await fetch(`/api/user/username/?username=${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		})

		if (response.ok) {
			const result = await response.json();

			return result.data
		}
	}
	catch (err) {
		console.error("atttention a l'erreur dans userExists");
	}

}

async function fetchMe(token: any) {

	try {
		const response = await fetch(`/api/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		})

		if (response.ok) {
			const result = await response.json();

			return result.user
		}
	}
	catch (err) {
		console.error("atttention a l'erreur dans userExists");
	}
}

async function gameExists(uuid: string, token: any) {

	try {
		const response = await fetch(`/api/games/room/?uuid=${uuid}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		})

		if (response.ok) {
			const result = await response.json();

			if (result.game === null)
				return false
			return true
		}
	}
	catch (err) {
		console.error("atttention a l'erreur dans userExists");
	}
}

async function checkThatImNotBlocked(myid: number, profilid: number, token: any) {

	try {

		console.log(myid, " ------- ", profilid)
		const response = await fetch('/api/friend/relation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token},
			body: JSON.stringify({
				user1: myid,
				user2: profilid,
			})
		}) 

		if (response.ok) {

			
			const relation = await response.json();

			if (relation == null)
				return false

			if ((relation.user_1 == profilid && relation.user1_state == 'angry') || (relation.user_2 == profilid && relation.user2_state == 'angry'))
				return true;
			return false;
		}
		else 
			console.error("attention erreur dans checkThatImNotBlocked");
	}
	catch (err) {
		console.error("attention erreur dans checkThatImNotBlocked")
	}
}