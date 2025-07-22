import { t } from '../../utils/translations';
import { createAccount } from './class/createAccount';
import { addEvent } from '../../utils/eventManager';


export function initializeCreateAccountEvents() {
	console.log('Initializing create-account page events');
	try {
		new createAccount();
	}
	catch (err: any) {
		console.log(err);
	}
	const backToLoginBtn = document.getElementById('backToLoginBtn');
	
	// Gestion du bouton retour au login
	if (backToLoginBtn) {
		addEvent(backToLoginBtn, 'click', () => {
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}
}

export function renderCreateAccount(): string {
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
						<input type="text" id="username" name="username" placeholder="${t('auth.createAccount.username')}" required autocomplete="username">
					</div>
					<div class="form-group">
						<input type="email" id="email" name="email" placeholder="${t('auth.createAccount.email')}" required autocomplete="email">
					</div>
					<div class="form-group">
						<input type="password" id="password" name="password" placeholder="${t('auth.createAccount.password')}"  required autocomplete="new-password">
					</div>
					<div class="form-group">
						<input type="password" id="confirmPassword" name="confirmPassword" placeholder="${t('auth.createAccount.confirmPassword')}" required autocomplete="new-password">
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