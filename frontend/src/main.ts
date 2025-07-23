import '/src/style.css';
import { router } from './utils/router.ts';
import './utils/websocketService.ts';

function init() {
	window.addEventListener('popstate', router);
}

init();