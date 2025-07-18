import { Pong } from '../../game/pong/pong';

export function renderPong(uuid: string) {

	setTimeout(() => {
		const canvas = document.getElementById('pongGameCanvas') as HTMLCanvasElement;
		if (!canvas) {
			console.error('Canvas not found!');
			return;
		}
		const game = new Pong(canvas, uuid);
		game.init();
	}, 0);

	return getTemplate();
}

function getTemplate() {
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
