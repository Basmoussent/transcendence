import { renderHome, initializeHomeEvents } from '../pages/menu/home';
import { renderLogin, initializeLoginEvents } from '../pages/auth/login';
import { renderCreateAccount, initializeCreateAccountEvents } from '../pages/auth/create-account';
import { renderForgotPassword, initializeForgotPasswordEvents } from '../pages/auth/forgot-password';
import { renderMain, initializeMainEvents } from '../pages/menu/main';
import { render404 } from '../components/404';
import { renderSocial } from '../pages/social/social';
import { renderProfil } from '../pages/social/profil';
import { renderMultiplayer, initializeMultiplayerEvents } from '../pages/game/multiplayer';
import { renderLocal, initializeLocalEvents } from '../pages/game/local';
import { renderTournaments, initializeTournamentEvents } from '../pages/game/tournament';

import { renderBlock } from '../pages/block/main';
import { renderChangePassword, initializeChangePasswordEvents } from '../pages/auth/change-password';
import { renderEditProfil, initializeEditProfileEvents } from '../pages/social/edit-profil';
import { getAuthToken } from './auth';
import { clearTranslationCache } from './translations';
import { renderPong } from '../pages/pong/pong';
import { renderMultiPong } from '../pages/pong/multiplayer-pong';
import { renderChooseGame } from '../pages/game/choose-game';

export async function router() {
  // Clear translation cache to ensure fresh translations
  clearTranslationCache();
  
  const path = window.location.pathname;
  const app = document.getElementById('app');
  if (!app) return;

  const publicRoutes = ['/', '/login', '/create-account', '/forgot-password', '/block'];
  const token = getAuthToken();

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

  switch (path) {
    case '/':
      view = renderHome();
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
    case '/multiplayer':
      view = renderMultiplayer();
      break;
    case '/local-game':
      view = renderLocal();
      break;
    case '/tournament':
      view = renderTournaments();
      break;
    case '/block':
      view = renderBlock();
      break;
    case '/game':
      view = renderChooseGame();
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
    default:
      view = render404();
  }
  app.innerHTML = view;

  // Initialiser les événements après le rendu pour les pages qui en ont besoin
  setTimeout(() => {
    switch (path) {
      case '/':
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
      case '/local-game':
        initializeLocalEvents();
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
