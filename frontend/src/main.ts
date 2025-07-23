import '/src/style.css';
import { router } from './utils/router.ts';
import { addEvent } from './utils/eventManager.ts';
import './utils/websocketService.ts';

function init() {
	window.addEventListener('popstate', router);
	window.addEventListener('languageChanged', router);
}

init();