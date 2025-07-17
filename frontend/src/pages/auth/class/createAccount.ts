export class createAccount {
	private createAccountForm: HTMLElement;
	private backToLoginBtn: HTMLElement;
	private messageContainer: HTMLElement;
	private messageContent: HTMLElement;
	private username: HTMLInputElement;
	private email: HTMLInputElement;
	private password: HTMLInputElement;
	private confirmPassword: HTMLInputElement;

	constructor() {

		this.createAccountForm = this.getElement('createAccountForm');
		this.backToLoginBtn = this.getElement('backToLoginBtn');
		this.messageContainer = this.getElement('messageContainer');
		this.messageContent = this.getElement('messageContent');

		this.username = this.getElement('username') as HTMLInputElement;
		this.email = this.getElement('email') as HTMLInputElement;
		this.password = this.getElement('password') as HTMLInputElement;
		this.confirmPassword = this.getElement('confirmPassword') as HTMLInputElement;

		this.setupEvents();
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private setupEvents() {

		this.backToLoginBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});

		this.createAccountForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			await this.submit();
		})
	}

	private async submit() {


		const username = this.username.value;
		const email = this.email.value;
		const password = this.password.value;
		const confirmPassword = this.confirmPassword.value;
		
		// Validation côté client
		if (!username || !email || !password || !confirmPassword) {
			this.showMessage('❌ Tous les champs sont obligatoires', 'error');
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
						this.showMessage(`❌ Erreur de validation: ${result.error || 'Données invalides'}`, 'error');
						break;
					case 409:
						this.showMessage(`❌ Conflit: ${result.error || 'Nom d\'utilisateur ou email déjà utilisé'}`, 'error');
						break;
					case 500:
						this.showMessage('❌ Erreur serveur. Veuillez réessayer plus tard.', 'error');
						break;
					default:
						this.showMessage(`❌ Erreur: ${result.error || 'Erreur inconnue'}`, 'error');
				}
			} else {
				this.showMessage('✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.', 'success');
				// Redirection après un délai pour laisser le temps de voir le message
				setTimeout(() => {
					window.history.pushState({}, '', '/login');
					window.dispatchEvent(new PopStateEvent('popstate'));
				}, 2000);
			}
		} catch (err) {
			console.error('Erreur réseau ou serveur', err);
			this.showMessage('❌ Erreur lors de la création du compte', 'error');
		}
	}

	private showMessage(message: string, type: 'success' | 'error') {
		
		if (this.messageContainer && this.messageContent) {
			this.messageContent.textContent = message;
			this.messageContainer.className = `message-container ${type}`;
			this.messageContainer.style.display = 'block';
			
			// Auto-hide pour les messages de succès après 3 secondes
			if (type === 'success') {
				setTimeout(() => {
					this.messageContainer.style.display = 'none';
				}, 3000);
			}
		}
	}
}
