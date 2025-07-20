import { t } from '../../utils/translations';
import { addEvent } from '../../utils/eventManager';
import { removeAuthToken } from '../../utils/auth';

export class main {

	private profileBtn: HTMLElement;
	private chatBtn: HTMLElement;
	private matchmakingBtn: HTMLElement;

	private logoutBtn: HTMLElement;
	private tournamentBtn: HTMLElement;


	constructor() {

		this.profileBtn = this.getElement('profileBtn');
		this.matchmakingBtn = this.getElement('matchmakingBtn');
		this.tournamentBtn = this.getElement('tournamentBtn');
		this.chatBtn = this.getElement('chatBtn');
		this.logoutBtn = this.getElement('logoutBtn');

		this.setupEvents();

	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private setupEvents() {
		addEvent(this.profileBtn, 'click', () => {
			window.history.pushState({}, '', '/me');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
		
		addEvent(this.matchmakingBtn, 'click', () => {
			window.history.pushState({}, '', '/matchmaking');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});

		addEvent(this.tournamentBtn, 'click', () => {
			window.history.pushState({}, '', '/tournament');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});

		addEvent(this.chatBtn, 'click', () => {
			window.history.pushState({}, '', '/chat');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});

		
		addEvent(this.logoutBtn, 'click', async () => {
			try {
				console.log('🚪 Tentative de logout...');
				removeAuthToken();
				console.log('✅ Logout réussi');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
			}
			catch (error) {
				console.error('❌ Erreur lors du logout:', error);
				// Fallback: redirection directe
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
			}
		});
	}
}

export function initializeHomeEvents() {
	console.log('Initializing create-account page events');
	const loginBtn = document.getElementById('loginBtn');
	
	// Gestion du bouton retour au login
	if (loginBtn) {
		addEvent(loginBtn, 'click', () => {
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}
}

export function renderHome(): string {
	return `
		<div class="home">
			<header class="top-header">
				<h1 class="site-title">${t('home.title')}</h1>
			</header>
			
			<main class="main-content">
				<div class="preview-container">
					<video class="preview-video" autoplay loop muted playsinline>
						<source src="/preview-pong.mp4" type="video/mp4">
						<div class="video-fallback">
							<div class="pong-demo">
								<div class="ball"></div>
								<div class="paddle paddle-left"></div>
								<div class="paddle paddle-right"></div>
							</div>
						</div>
					</video>
					<div class="preview-overlay">
						<h2>${t('home.subtitle')}</h2>
						<p>${t('home.description')}</p>
					</div>
				</div>
			</main>
		</div>
		<div class="connexion">
			<button id="loginBtn" class="login-btn">${t('home.login')}</button>
		</div>

		<style>
			.home {
				max-width: 1200px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}

			.top-header {
				margin-bottom: 30px;
			}

			.site-title {
				font-size: 2.5em;
				background: linear-gradient(45deg, #a8aba7, #ef659f);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				margin: 0;
			}

			.main-content {
				margin-bottom: 40px;
			}

			.preview-container {
				position: relative;
				width: 100%;
				max-width: 800px;
				margin: 0 auto;
				border-radius: 20px;
				overflow: hidden;
				box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
			}

			.preview-video {
				width: 100%;
				height: auto;
				display: block;
				border-radius: 20px;
			}

			.video-fallback {
				width: 100%;
				height: 400px;
				background: #000;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.pong-demo {
				width: 100%;
				height: 100%;
				position: relative;
				background: #1a1a2e;
			}

			.ball {
				width: 20px;
				height: 20px;
				background: #fff;
				border-radius: 50%;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				animation: moveBall 2s infinite linear;
			}

			.paddle {
				width: 20px;
				height: 100px;
				background: #fff;
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
			}

			.paddle-left {
				left: 50px;
			}

			.paddle-right {
				right: 50px;
			}

			.preview-overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(0, 0, 0, 0.5);
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				padding: 20px;
				text-align: center;
				color: white;
			}

			.preview-overlay h2 {
				font-size: 2em;
				margin-bottom: 15px;
				text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
			}

			.preview-overlay p {
				font-size: 1.2em;
				max-width: 600px;
				margin: 0 auto;
				text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
			}

			.connexion {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 20px;
			}

			.login-btn {
				font-size: 1.2em;
				font-weight: bold;
				padding: 15px 40px;
				background: linear-gradient(45deg, #a8aba7, #ef659f);
				color: white;
				border: none;
				border-radius: 50px;
				cursor: pointer;
				transition: all 0.3s ease;
				box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
				text-transform: uppercase;
				letter-spacing: 1px;
			}

			.login-btn:hover {
				transform: translateY(-3px);
				box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
			}

			.login-btn:active {
				transform: translateY(-1px);
				box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
			}

			@keyframes moveBall {
				0% { transform: translate(-50%, -50%) translateX(-200px); }
				50% { transform: translate(-50%, -50%) translateX(200px); }
				100% { transform: translate(-50%, -50%) translateX(-200px); }
			}

			/* Desktop Layout */
			@media (min-width: 1024px) {
				.home {
					padding: 40px;
				}

				.site-title {
					font-size: 3em;
				}

				.preview-overlay h2 {
					font-size: 2.5em;
				}

				.preview-overlay p {
					font-size: 1.4em;
				}

				.login-btn {
					font-size: 1.4em;
					padding: 20px 60px;
				}
			}

			/* Tablet Layout */
			@media (min-width: 768px) and (max-width: 1023px) {
				.home {
					padding: 30px;
				}

				.site-title {
					font-size: 2.8em;
				}

				.preview-overlay h2 {
					font-size: 2.2em;
				}

				.preview-overlay p {
					font-size: 1.3em;
				}
			}

			/* Mobile Layout */
			@media (max-width: 767px) {
				.home {
					padding: 15px;
				}

				.site-title {
					font-size: 2em;
				}

				.preview-overlay h2 {
					font-size: 1.8em;
				}

				.preview-overlay p {
					font-size: 1.1em;
				}

				.login-btn {
					font-size: 1.1em;
					padding: 12px 30px;
				}
			}

			/* Small Mobile Layout */
			@media (max-width: 480px) {
				.home {
					padding: 10px;
				}

				.site-title {
					font-size: 1.8em;
				}

				.preview-overlay h2 {
					font-size: 1.5em;
				}

				.preview-overlay p {
					font-size: 1em;
				}

				.login-btn {
					font-size: 1em;
					padding: 10px 25px;
				}
			}
		</style>
	`;
}