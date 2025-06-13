import { t } from '../../utils/translations';

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
					<a href="/login" class="back-to-login">${t('auth.forgotPassword.backToLogin')}</a>
				</div>
			</div>
		</main>
	</div>
	`;
}

document.addEventListener('DOMContentLoaded', () => {
	const forgotPasswordForm = document.getElementById('forgotPasswordForm');
	forgotPasswordForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		const email = (document.getElementById('email') as HTMLInputElement).value;
		
		// TODO: Implement actual password reset logic here
		console.log('Password reset attempt:', { email });
		alert('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
	});
});
