import { t } from '../../utils/translations';

export function renderCreateAccount(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('auth.createAccount.title')}</h2>
				<form id="createAccountForm" class="login-form">
					<div class="form-group">
						<input type="text" id="username" name="username" placeholder="${t('auth.createAccount.username')}" required>
					</div>
					<div class="form-group">
						<input type="email" id="email" name="email" placeholder="${t('auth.createAccount.email')}" required>
					</div>
					<div class="form-group">
						<input type="password" id="password" name="password" placeholder="${t('auth.createAccount.password')}" required>
					</div>
					<div class="form-group">
						<input type="password" id="confirmPassword" name="confirmPassword" placeholder="${t('auth.createAccount.confirmPassword')}" required>
					</div>
					<button type="submit" class="login-btn">${t('auth.createAccount.submit')}</button>
				</form>
				<div class="login-options">
					<button id="backToLoginBtn" class="back-to-login-btn">${t('auth.createAccount.backToLogin')}</button>
				</div>
			</div>
		</main>
	</div>

	<style>
		.back-to-login-btn {
			background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
			color: white;
			border: none;
			padding: 10px 20px;
			border-radius: 8px;
			cursor: pointer;
			font-size: 14px;
			font-weight: 500;
			transition: all 0.3s ease;
			text-decoration: none;
			display: inline-block;
		}

		.back-to-login-btn:hover {
			background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		}

		.back-to-login-btn:active {
			transform: translateY(0);
		}
	</style>
	`;
}

function initializeCreateAccountEvents() {
	const createAccountForm = document.getElementById('createAccountForm');
	const backToLoginBtn = document.getElementById('backToLoginBtn');
	
	// Gestion du bouton retour au login
	if (backToLoginBtn) {
		backToLoginBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	createAccountForm?.addEventListener('submit', async (e) => {
		e.preventDefault();

		const username = (document.getElementById('username') as HTMLInputElement).value;
		const email = (document.getElementById('email') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;
		const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
		
		if (password !== confirmPassword) {
			alert('❌ Les mots de passe ne correspondent pas');
			return;
		}

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					email,
					password,
					confirmPassword
				})
			});

			const result = await response.json();

			if (!response.ok) {
				alert(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
			} else {
				alert('✅ Compte créé avec succès');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
			}
		} catch (err) {
			console.error('Erreur réseau ou serveur', err);
			alert('❌ Erreur lors de la création du compte');
		}
	});
}

export { initializeCreateAccountEvents };
