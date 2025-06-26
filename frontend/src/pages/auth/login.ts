import { t } from '../../utils/translations';
import { setAuthToken, debugCookies } from '../../utils/auth';

export function renderLogin(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('auth.login.title')}</h2>
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
					<a href="#" id="forgot-password">${t('auth.login.forgotPassword')}</a>
					<a href="#" id="create-account">${t('auth.login.createAccount')}</a>
				</div>
			</div>
		</main>
	</div>
	`;
}

// Add event listener after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('loginForm');
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
			alert(`❌ Error: ${result.error || 'Invalid credentials'}`);
			return;
		}

		console.log('✅ Connexion réussie');
		console.log('Headers de réponse:', response.headers);
		
		// Le token est maintenant dans un cookie, mais on peut aussi le récupérer du header pour la compatibilité
		const token = response.headers.get('x-access-token');
		if (token) {
			console.log('🎫 Token reçu dans le header');
			setAuthToken(token);
		} else {
			console.log('Token attendu dans les cookies');
		}
		
		// Debug: vérifier les cookies après login
		console.log('🔍 Debug après login:');
		debugCookies();
		
		// Attendre un peu pour que les cookies soient bien définis
		setTimeout(() => {
			console.log('🔄 Redirection vers /main');
			window.location.href = '/main';
		}, 100);
		
	} catch (err) {
		console.error('❌ Network or server error', err);
		alert('❌ Error during login');
	}
	});

	
	const ForgotPassword = document.getElementById('forgot-password');
	ForgotPassword?.addEventListener('click', () => {
		window.location.href = '/forgot-password';
	});

	const CreateAccount = document.getElementById('create-account');
	CreateAccount?.addEventListener('click', () => {
		window.location.href = '/create-account';
	});
});