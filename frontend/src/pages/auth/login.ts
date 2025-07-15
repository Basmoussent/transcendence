import { t } from '../../utils/translations';
import { setAuthToken } from '../../utils/auth';

export function renderLogin(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('auth.login.title')}</h2>
				
				<!-- Message de succès/erreur -->
				<div id="messageContainer" class="message-container" style="display: none;">
					<div id="messageContent" class="message-content"></div>
				</div>
				
				<form id="loginForm" class="login-form">
					<div class="form-group">
						<input type="text" id="username" name="username" placeholder="${t('auth.login.username')}" required>
					</div>
					<div class="form-group">
						<input type="password" id="password" name="password" placeholder="${t('auth.login.password')}" required>
					</div>
					<button type="submit" class="login-btn">${t('auth.login.submit')}</button>
				</form>
				<div class="login-options">
					<button id="forgot-password" class="link-button">${t('auth.login.forgotPassword')}</button>
					<button id="create-account" class="link-button">${t('auth.login.createAccount')}</button>
				</div>
			</div>
		</main>
	</div>

	<style>
		.message-container {
			margin-bottom: 20px;
			padding: 12px 16px;
			border-radius: 8px;
			font-size: 14px;
			font-weight: 500;
			text-align: center;
			animation: slideDown 0.3s ease-out;
		}

		.message-container.success {
			background-color: #d4edda;
			border: 1px solid #c3e6cb;
			color: #155724;
		}

		.message-container.error {
			background-color: #f8d7da;
			border: 1px solid #f5c6cb;
			color: #721c24;
		}

		@keyframes slideDown {
			from {
				opacity: 0;
				transform: translateY(-10px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.link-button {
			background: none;
			border: none;
			color: #4a90e2;
			cursor: pointer;
			text-decoration: underline;
			font-size: 14px;
			padding: 5px 0;
			margin: 0 10px;
		}

		.link-button:hover {
			color: #357abd;
		}
	</style>
	`;
}

function initializeLoginEvents() {
	const loginForm = document.getElementById('loginForm');
	
	// Fonction pour afficher les messages
	function showMessage(message: string, type: 'success' | 'error') {
		const messageContainer = document.getElementById('messageContainer');
		const messageContent = document.getElementById('messageContent');
		
		if (messageContainer && messageContent) {
			messageContent.textContent = message;
			messageContainer.className = `message-container ${type}`;
			messageContainer.style.display = 'block';
			
			// Auto-hide pour les messages de succès après 3 secondes
			if (type === 'success') {
				setTimeout(() => {
					messageContainer.style.display = 'none';
				}, 3000);
			}
		}
	}
	
	loginForm?.addEventListener('submit', async (e) => {
	e.preventDefault();

	const username = (document.getElementById('username') as HTMLInputElement).value;
	const password = (document.getElementById('password') as HTMLInputElement).value;

	try {
		console.log('🔐 Tentative de connexion pour:', username);
		console.log('🌐 URL actuelle:', window.location.href);
		
		const response = await fetch('/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
		credentials: 'include' // Important pour recevoir les cookies
		});

		const result = await response.json();

		if (!response.ok) {
			showMessage(`❌ Erreur: ${result.error || 'Identifiants invalides'}`, 'error');
			return;
		}

		console.log('✅ Connexion réussie');
		console.log('Headers de réponse:', response.headers);
		
		// Le token est maintenant dans un cookie, mais on peut aussi le récupérer du header pour la compatibilité
		const token = response.headers.get('x-access-token');
		if (token) {
			console.log('🎫 Token reçu dans le header');
			setAuthToken(token);
			console.log(`le token des familles `, token)
		} else {
			console.log('Token attendu dans les cookies');
		}
		
		
		// Attendre un peu pour que les cookies soient bien définis
		setTimeout(() => {
			console.log('🔄 Redirection vers /main');
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new PopStateEvent('popstate'));
		}, 100);
		
	} catch (err) {
		console.error('❌ Network or server error', err);
		showMessage('❌ Erreur lors de la connexion', 'error');
	}
	});

	
	const ForgotPassword = document.getElementById('forgot-password');
	ForgotPassword?.addEventListener('click', () => {
		window.history.pushState({}, '', '/forgot-password');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	const CreateAccount = document.getElementById('create-account');
	CreateAccount?.addEventListener('click', () => {
		window.history.pushState({}, '', '/create-account');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});
}

export { initializeLoginEvents };