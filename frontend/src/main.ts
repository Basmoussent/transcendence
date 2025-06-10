import { router } from './utils/router.ts';

function init() {
  window.addEventListener('popstate', router);
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches('a[data-link]')) {
      e.preventDefault();
      const href = target.getAttribute('href')!;
      history.pushState(null, '', href);
      router();
    }
  });

  router();
}

init();