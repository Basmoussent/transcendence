export function renderLogin(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>Connexion</h2>
				<form id="loginForm" class="login-form">
					<div class="form-group">
						<input type="text" id="username" name="username" placeholder="Nom d'utilisateur" required>
					</div>
					<div class="form-group">
						<input type="password" id="password" name="password" placeholder="Mot de passe" required>
					</div>
					<button type="submit" class="login-btn">Se connecter</button>
				</form>
				<div class="login-options">
					<a href="#" id="forgot-password">Mot de passe oublié ?</a>
					<a href="#" id="create-account">Créer un compte</a>
				</div>
			</div>
		</main>
	</div>
	`;
}

// Add event listener after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('loginForm');
	loginForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		const username = (document.getElementById('username') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;
		
		// TODO: Implement actual login logic here
		console.log('Login attempt:', { username, password });
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