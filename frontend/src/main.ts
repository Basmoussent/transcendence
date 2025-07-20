import '/src/style.css';
import { router } from './utils/router.ts';
import { addEvent } from './utils/eventManager.ts';

function init() {
	addEvent(window, 'popstate', router);
	
	// Listen for language changes to trigger router
	addEvent(window, 'languageChanged', router);
	
	addEvent(document, 'click', (e) => {
		const target = e.target as HTMLElement;
		if (target.matches('a[data-link]')) {
			e.preventDefault();
			const href = target.getAttribute('href')!;
			history.pushState(null, '', href);
			router();
		}
	});
}

init();