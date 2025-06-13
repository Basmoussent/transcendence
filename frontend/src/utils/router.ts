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

export function router() {
  const path = window.location.pathname;
  const app = document.getElementById('app');
  if (!app) return;

  // const hostname = window.location.hostname;
  // const subdomain = hostname.split('.')[0];

  // const supportedLanguages = ['en', 'fr', 'es'];
  // const language = supportedLanguages.includes(subdomain) ? subdomain : 'en';

  let view = '';

  switch (path) {
    case '/':
      view = renderHome();
      break;
    // case '/about':
    //   view = renderAbout();
    //   break;
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
    default:
      view = render404();
  }
  app.innerHTML = view;
}