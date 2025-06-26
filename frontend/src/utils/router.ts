import { renderHome } from '../pages/menu/home';
import { renderLogin } from '../pages/auth/login';
import { renderCreateAccount } from '../pages/auth/create-account';
import { renderForgotPassword } from '../pages/auth/forgot-password';
import { renderMain } from '../pages/menu/main';
import { render404 } from '../components/404';
import { renderSocial } from '../pages/social/social';
import { renderProfil } from '../pages/social/profil';
import { renderMultiplayer } from '../pages/game/multiplayer';
import { renderLocal } from '../pages/game/local';
import { renderBlock } from '../pages/block/main';
import { renderChangePassword } from '../pages/auth/change-password';
import { renderEditProfil } from '../pages/social/edit-profil';

export function router() {
  const path = window.location.pathname;
  const app = document.getElementById('app');
  if (!app) return;

  const publicRoutes = ['/', '/login', '/create-account', '/forgot-password'];
  const token = localStorage.getItem('x-access-token');

  if (!publicRoutes.includes(path) && !token) {
    window.history.pushState({}, '', '/login');
    app.innerHTML = renderLogin();
    return;
  }

  if (path === '/login' && token) {
    window.history.pushState({}, '', '/main');
    app.innerHTML = renderMain();
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
      view = renderProfil();
      break;
    case '/multiplayer':
      view = renderMultiplayer();
      break;
    case '/local-game':
      view = renderLocal();
      break;
    case '/block':
      view = renderBlock();
      break;
    case '/change-password':
      view = renderChangePassword();
      break;
    case '/edit-profil':
      view = renderEditProfil();
      break;
    // case '/pong':
    //   view = 
    default:
      view = render404();
  }
  app.innerHTML = view;
}
