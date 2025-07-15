import { renderHome, initializeHomeEvents } from '../pages/menu/home';
import { renderLogin, initializeLoginEvents } from '../pages/auth/login';
import { renderCreateAccount, initializeCreateAccountEvents } from '../pages/auth/create-account';
import { renderForgotPassword, initializeForgotPasswordEvents } from '../pages/auth/forgot-password';
import { renderMain, initializeMainEvents } from '../pages/menu/main';
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
import { renderPong } from '../pages/pong/pong';
import { renderMultiPong } from '../pages/pong/multiplayer-pong';
import { renderChooseGame } from '../pages/game/choose-game';
import { initAlive } from './auth';
import { renderPong } from '../pages/pong/pong';
import { initAlive } from './auth';
import { renderFriends } from '../pages/social/friends';

export async function router() {
  // Clear translation cache to ensure fresh translations
  clearTranslationCache();
  
  let path = window.location.pathname;
  const app = document.getElementById('app');
  if (!app) return;

  const publicRoutes = ['/', '/login', '/create-account', '/forgot-password'];
  const token = getAuthToken();


  let uuid: string = '';

  if (path.startsWith('/room/') || path.startsWith('/user/')) {
    uuid = path.substring(6);
    path = path.startsWith('/room/') ? '/room' : '/user';

  }
  
  if (!publicRoutes.includes(path) && !token) {
    window.history.pushState({}, '', '/login');
    app.innerHTML = renderLogin();
    setTimeout(() => {
      initializeLoginEvents();
    }, 0);
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
      setTimeout(() => {
        initializeLoginEvents();
      }, 0);
      return;
    }
  };

  if (path === '/login' && token) {
    window.history.pushState({}, '', '/main');
    app.innerHTML = renderMain();
    setTimeout(() => {
      initializeMainEvents();
    }, 0);
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
    case '/multi-pong':
      view = renderMultiPong();
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
    console.log("initAlive");
    console.log(tokenAuth);
  }

  // Initialiser les événements après le rendu pour les pages qui en ont besoin
  setTimeout(() => {
    if (!publicRoutes.includes(path))
      initAlive();
    switch (path) {
      case '/':
        initializeHomeEvents();
        break;
      case '/lang':
        initializeHomeEvents();
        break;
      case '/login':
        initializeLoginEvents();
        break;
      case '/create-account':
        initializeCreateAccountEvents();
        break;
      case '/forgot-password':
        initializeForgotPasswordEvents();
        break;
      case '/main':
        initializeMainEvents();
        break;
      case '/multiplayer':
        initializeMultiplayerEvents();
        break;
      case '/tournament':
        initializeTournamentEvents();
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
