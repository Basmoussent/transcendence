import { MultiPong } from '../../game/pong/multiplayer/multi-pong';
import { getAuthToken } from '../../utils/auth';

export async function renderMultiPong(uuid: string) {

	const authToken = getAuthToken()
			if (!authToken) {
				alert('❌ Token d\'authentification manquant');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}
	
			const response = await fetch(`/api/games/?uuid=${uuid}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': authToken
					},
			});
	
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.details || "pblm recuperer les infos de la game le multipong");
			}
	
			const result = await response.json();

			if (result.game.users_needed + result.game.ai < 3)
				return get1v1Template();
			else
				return getTemplate();
}

export function initializeMultiPongEvents(uuid: string) {
	console.log('Initializing Pong game events...');
	const canvas = document.getElementById('pongGameCanvas') as HTMLCanvasElement;
	if (!canvas) {
		console.error('Canvas not found!');
		return;
	}
	console.log('Canvas found, creating game instance...');
	const game = new MultiPong(canvas, uuid);
	game.asyncInit();
}

function getTemplate(): string {
	return `
		<div class="pong-game-container">
			<div class="game-wrapper">
				<canvas id="pongGameCanvas" width="800" height="800"></canvas>
			</div>
		</div>
		<style>
			.pong-game-container {
				display: flex;
				justify-content: center;
				align-items: center;
				min-height: 100vh;
				background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
				padding: 20px;
			}
			.game-wrapper {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 10px;
				padding: 20px;
				box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
				border: 1px solid rgba(255, 255, 255, 0.18);
				display: flex;
				justify-content: center;
				align-items: center;
				width: 90vmin;
				height: 90vmin;
			}
			#pongGameCanvas {
				width: 100%;
				height: 100%;
				display: block;
				background-color: #1a1a2e;
				border-radius: 5px;
			}
			
			/* Mobile Layout */
			@media (max-width: 767px) {
				.pong-game-container {
					padding: 10px;
				}
				.game-wrapper {
					width: 95vmin;
					height: 95vmin;
					padding: 15px;
				}
			}
			
			/* Très petits écrans */
			@media (max-width: 480px) {
				.game-wrapper {
					width: 98vmin;
					height: 98vmin;
					padding: 10px;
				}
			}
		</style>
	`;
}

function get1v1Template() {
	return `
		<div class="pong-game-container">
			<div class="game-wrapper">
				<canvas id="pongGameCanvas" width="800" height="600"></canvas>
			</div>
		</div>

		<style>
			.pong-game-container {
				display: flex;
				justify-content: center;
				align-items: center;
				min-height: 100vh;
				background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
				padding: 20px;
			}

			.game-wrapper {
				width: 90vw;
				height: 90vh;
				background: rgba(255, 255, 255, 0.1);
				border-radius: 10px;
				padding: 20px;
				box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
				border: 1px solid rgba(255, 255, 255, 0.18);
				display: flex;
				justify-content: center;
				align-items: center;
			}

			#pongGameCanvas {
				width: 100%;
				height: 100%;
				display: pong;
				background-color: #1a1a2e;
			}

			/* Desktop Layout */
			@media (min-width: 1280px) {
				.game-wrapper {
					width: 80vw;
					height: 85vh;
					padding: 30px;
				}
			}

			/* Tablet Layout */
			@media (max-width: 1279px) {
				.game-wrapper {
					width: 90vw;
					height: 80vh;
					padding: 15px;
				}
			}

			/* Mobile Layout */
			@media (max-width: 767px) {
				.pong-game-container {
					padding: 10px;
				}
				.game-wrapper {
					width: 95vw;
					height: 75vh;
					padding: 10px;
				}
			}

			/* Small Mobile Layout */
			@media (max-width: 480px) {
				.game-wrapper {
					width: 98vw;
					height: 70vh;
					padding: 5px;
				}
			}
		</style>
	`;
}