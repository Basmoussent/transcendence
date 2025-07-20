import { addEvent } from '../utils/eventManager';

export function render404() {
	const htmlContent = `
		<div class="not-found">
			<div class="not-found-content">
				<div class="error-code">
					<span class="number">4</span>
					<div class="pong-ball"></div>
					<span class="number">4</span>
				</div>
				
				<h1 class="error-title">Page Not Found</h1>
				<p class="error-message">Oops! The page you're looking for seems to have disappeared into the void.</p>
				
				<button class="back-button" id="backBtn">
					<i class="fas fa-arrow-left"></i>
					Back to Home
				</button>
			</div>
		</div>

		<style>
			.not-found {
				display: flex;
				justify-content: center;
				align-items: center;
				min-height: 100vh;
				background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
				padding: 20px;
			}

			.not-found-content {
				text-align: center;
				background: rgba(255, 255, 255, 0.1);
				backdrop-filter: blur(10px);
				border-radius: 20px;
				padding: 40px;
				box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
				border: 1px solid rgba(255, 255, 255, 0.18);
				animation: fadeIn 0.5s ease-out;
			}

			.error-code {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-bottom: 20px;
				position: relative;
			}

			.number {
				font-size: 8em;
				font-weight: bold;
				color: #fff;
				text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
			}

			.pong-ball {
				width: 40px;
				height: 40px;
				background: #e74c3c;
				border-radius: 50%;
				margin: 0 20px;
				animation: bounce 1s infinite;
				box-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
			}

			.error-title {
				color: #fff;
				font-size: 2em;
				margin-bottom: 15px;
				text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
			}

			.error-message {
				color: #ccc;
				font-size: 1.2em;
				margin-bottom: 30px;
				max-width: 400px;
				line-height: 1.5;
			}

			.back-button {
				display: inline-flex;
				align-items: center;
				gap: 10px;
				padding: 12px 25px;
				border: none;
				border-radius: 12px;
				font-size: 1.1em;
				font-weight: 600;
				color: white;
				background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
				cursor: pointer;
				transition: all 0.3s ease;
			}

			.back-button:hover {
				transform: translateY(-2px);
				box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
			}

			.back-button:active {
				transform: translateY(0);
			}

			.back-button i {
				font-size: 1.1em;
			}

			@keyframes bounce {
				0%, 100% {
					transform: translateY(0);
				}
				50% {
					transform: translateY(-20px);
				}
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}

			/* Responsive design */
			@media (max-width: 600px) {
				.not-found-content {
					padding: 20px;
				}

				.number {
					font-size: 6em;
				}

				.pong-ball {
					width: 30px;
					height: 30px;
					margin: 0 15px;
				}

				.error-title {
					font-size: 1.5em;
				}

				.error-message {
					font-size: 1em;
				}

				.back-button {
					padding: 10px 20px;
					font-size: 1em;
				}
			}
		</style>
	`;

setTimeout(() => {
		const backBtn = document.getElementById('backBtn');

		if (backBtn) {
			addEvent(backBtn, 'click', () => {
				window.history.pushState({}, '', '/main');
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
		}
	}, 0);
	return htmlContent;
}
