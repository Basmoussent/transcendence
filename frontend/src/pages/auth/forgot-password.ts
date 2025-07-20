import { t } from '../../utils/translations';
import { addEvent } from '../../utils/eventManager';

export function renderForgotPassword(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('auth.forgotPassword.title')}</h2>
				<p class="forgot-password-text">${t('auth.forgotPassword.description')}</p>
				<form id="forgotPasswordForm" class="login-form">
					<div class="form-group">
						<input type="email" id="email" name="email" placeholder="${t('auth.forgotPassword.email')}" required>
					</div>
					<button type="submit" class="login-btn">${t('auth.forgotPassword.submit')}</button>
				</form>
				<div class="login-options">
					<button id="backToLoginBtn" class="back-to-login-btn">${t('auth.forgotPassword.backToLogin')}</button>
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

function initializeForgotPasswordEvents() {
	const forgotPasswordForm = document.getElementById('forgotPasswordForm');
	const backToLoginBtn = document.getElementById('backToLoginBtn');

	// Gestion du bouton retour au login
	if (backToLoginBtn) {
		addEvent(backToLoginBtn, 'click', () => {
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	if (forgotPasswordForm) {
		addEvent(forgotPasswordForm, 'submit', (e: any) => {
			e.preventDefault();
			const email = (document.getElementById('email') as HTMLInputElement).value;
			
			// TODO: Implement actual password reset logic here
			console.log('Password reset attempt:', { email });
			alert('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
		});
	}
}

export { initializeForgotPasswordEvents };
