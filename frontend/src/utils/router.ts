import { renderHome } from '../pages/home';
import { renderLogin } from '../pages/login';


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
    default:
      view = `<h2>404 - Page not found</h2>`;
  }
  app.innerHTML = view;
}