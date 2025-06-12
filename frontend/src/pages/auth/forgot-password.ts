export function renderForgotPassword(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>Mot de passe oublié</h2>
				<p class="forgot-password-text">Entrez votre email pour recevoir un lien de réinitialisation</p>
				<form id="forgotPasswordForm" class="login-form">
					<div class="form-group">
						<input type="email" id="email" name="email" placeholder="Email" required>
					</div>
					<button type="submit" class="login-btn">Envoyer le lien</button>
				</form>
				<div class="login-options">
					<a href="/login" class="back-to-login">Retour à la connexion</a>
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
