import { setAuthToken } from '../../../utils/auth';

export class login {

	private loginForm: HTMLElement;
	private messageContainer: HTMLElement;
	private messageContent: HTMLElement;
	private forgotPassword: HTMLElement;
	private createAccount: HTMLElement;
	private username: HTMLInputElement;
	private password: HTMLInputElement;

	constructor() {

		this.loginForm = this.getElement('loginForm');
		this.messageContainer = this.getElement('messageContainer');
		this.messageContent = this.getElement('messageContent');
		this.createAccount = this.getElement('create-account');
		this.username = this.getElement('username') as HTMLInputElement;
		this.password = this.getElement('password') as HTMLInputElement;

		this.setupEvents();
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private setupEvents() {

		this.loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			await this.submitLogin();
		});

		this.createAccount.addEventListener('click', () => {
			window.history.pushState({}, '', '/create-account');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	private async submitLogin() {
		const username = this.username.value;
		const password = this.password.value;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
				credentials: 'include'
			});

			const result = await response.json();

			if (!response.ok) {
				this.showMessage(`❌ Erreur: ${result.error || 'Identifiants invalides'}`, 'error');
				return;
			}

			console.log('✅ Connexion réussie');
			console.log('Headers de réponse:', response.headers);
			
			const token = response.headers.get('x-access-token');
			if (token) {
				console.log('🎫 Token reçu dans le header');
				setAuthToken(token);
				console.log(`le token des familles `, token)
			}
			else
				console.log('Token attendu dans les cookies');

			if (response.message === "2FA needed") {
					setTimeout(() => {
					console.log('🔄 Redirection vers /2fa-login');
					window.changeLanguage(result.user.language);
					window.history.pushState({}, '', '/2fa-login');
					window.dispatchEvent(new PopStateEvent('popstate'));
				}, 100);
			}
			else {
				setTimeout(() => {
					window.changeLanguage(result.user.language);
					console.log('🔄 Redirection vers /main');
					window.history.pushState({}, '', '/main');
					window.dispatchEvent(new PopStateEvent('popstate'));
				}, 100);
			}
			
		} catch (err) {
			console.error('❌ Network or server error', err);
			this.showMessage('❌ Erreur lors de la connexion', 'error');
		}
	}

	private showMessage(message: string, type: 'success' | 'error') {
		
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