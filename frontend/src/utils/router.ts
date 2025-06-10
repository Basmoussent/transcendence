import { renderHome } from '../pages/home';
import { renderLogin } from '../pages/login';
import { renderCreateAccount } from '../pages/create-account';
import { renderForgotPassword } from '../pages/forgot-password';


export function router() {
  const path = window.location.pathname;
  const app = document.getElementById('app');
  if (!app) return;

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
    case '/login':
       view = renderLogin();
       break;
    case '/create-account':
      view = renderCreateAccount();
      break;
    case '/forgot-password':
      view = renderForgotPassword();
      break;
    default:
      view = `<h2>404 - Page not found</h2>`;
  }
  app.innerHTML = view;
}