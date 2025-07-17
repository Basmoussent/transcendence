import { t } from '../../utils/translations';
import { createAccount } from './class/createAccount'

export function renderCreateAccount() {

	setTimeout(async () => {
		console.log('Initializing create-account page');
		try {
			new createAccount();
		}
		catch (err:any) {
			console.log(err);
		}
	}, 0);
	return getTemplate();
}

function getTemplate(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('auth.createAccount.title')}</h2>
				
				<!-- Message de succès/erreur -->
				<div id="messageContainer" class="message-container" style="display: none;">
					<div id="messageContent" class="message-content"></div>
				</div>
				
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
		
		// Validation côté client
		if (!username || !email || !password || !confirmPassword) {
			showMessage('❌ Tous les champs sont obligatoires', 'error');
			return;
		}

		// if (username.length < 3) {
		// 	showMessage('❌ Le nom d\'utilisateur doit contenir au moins 3 caractères', 'error');
		// 	return;
		// }

		// if (password.length < 6) {
		// 	showMessage('❌ Le mot de passe doit contenir au moins 6 caractères', 'error');
		// 	return;
		// }

		// if (password !== confirmPassword) {
		// 	showMessage('❌ Les mots de passe ne correspondent pas', 'error');
		// 	return;
		// }

		// // Validation email basique
		// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		// if (!emailRegex.test(email)) {
		// 	showMessage('❌ Format d\'email invalide', 'error');
		// 	return;
		// }

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
				// Gestion spécifique des erreurs selon le code de statut
				switch (response.status) {
					case 400:
						showMessage(`❌ Erreur de validation: ${result.error || 'Données invalides'}`, 'error');
						break;
					case 409:
						showMessage(`❌ Conflit: ${result.error || 'Nom d\'utilisateur ou email déjà utilisé'}`, 'error');
						break;
					case 500:
						showMessage('❌ Erreur serveur. Veuillez réessayer plus tard.', 'error');
						break;
					default:
						showMessage(`❌ Erreur: ${result.error || 'Erreur inconnue'}`, 'error');
				}
			} else {
				showMessage('✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.', 'success');
				// Redirection après un délai pour laisser le temps de voir le message
				setTimeout(() => {
					window.history.pushState({}, '', '/login');
					window.dispatchEvent(new PopStateEvent('popstate'));
				}, 2000);
			}
		}
		catch (err) {
			console.error('Erreur réseau ou serveur', err);
			showMessage('❌ Erreur lors de la création du compte', 'error');
		}
	});
}

export { initializeCreateAccountEvents };
