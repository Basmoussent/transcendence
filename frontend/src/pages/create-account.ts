export function renderCreateAccount(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>Créer un compte</h2>
				<form id="createAccountForm" class="login-form">
					<div class="form-group">
						<input type="text" id="username" name="username" placeholder="Nom d'utilisateur" required>
					</div>
					<div class="form-group">
						<input type="email" id="email" name="email" placeholder="Email" required>
					</div>
					<div class="form-group">
						<input type="password" id="password" name="password" placeholder="Mot de passe" required>
					</div>
					<div class="form-group">
						<input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirmer le mot de passe" required>
					</div>
					<button type="submit" class="login-btn">Créer un compte</button>
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
	const createAccountForm = document.getElementById('createAccountForm');
	
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
			const response = await fetch('http://localhost:8000/auth/register', {
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
				window.location.href = "/login";
			}
		} catch (err) {
			console.error('Erreur réseau ou serveur', err);
			alert('❌ Erreur lors de la création du compte');
		}
	});
});
