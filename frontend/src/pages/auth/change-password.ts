import { t } from '../../utils/translations';
import { getAuthToken } from '../../utils/auth';

export function renderChangePassword(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('auth.changePassword.title') || 'Changer le mot de passe'}</h2>
				<form id="changePasswordForm" class="login-form">
					<div class="form-group">
						<input type="password" id="currentPassword" name="currentPassword" placeholder="${t('auth.changePassword.currentPassword') || 'Mot de passe actuel'}" required>
					</div>
					<div class="form-group">
						<input type="password" id="newPassword" name="newPassword" placeholder="${t('auth.changePassword.newPassword') || 'Nouveau mot de passe'}" required>
					</div>
					<div class="form-group">
						<input type="password" id="confirmNewPassword" name="confirmNewPassword" placeholder="${t('auth.changePassword.confirmNewPassword') || 'Confirmer le nouveau mot de passe'}" required>
					</div>
					<button type="submit" class="login-btn">${t('auth.changePassword.submit') || 'Modifier le mot de passe'}</button>
				</form>
				<div class="login-options">
					<button id="backToProfileBtn" class="back-to-profile-btn">${t('auth.changePassword.backToProfile') || 'Retour au profil'}</button>
				</div>
			</div>
		</main>
	</div>

	<style>
		.back-to-profile-btn {
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

		.back-to-profile-btn:hover {
			background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		}

		.back-to-profile-btn:active {
			transform: translateY(0);
		}
	</style>
	`;
}

function initializeChangePasswordEvents() {
	const changePasswordForm = document.getElementById('changePasswordForm');
	const backToProfileBtn = document.getElementById('backToProfileBtn');

	// Gestion du bouton retour au profil
	if (backToProfileBtn) {
		backToProfileBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/profil');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	changePasswordForm?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement).value;
		const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
		const confirmNewPassword = (document.getElementById('confirmNewPassword') as HTMLInputElement).value;
		if (newPassword !== confirmNewPassword) {
			alert('❌ Les nouveaux mots de passe ne correspondent pas');
			return;
		}
		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Token d\'authentification manquant');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}
			const response = await fetch('/api/edit/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token
				},
				body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
			});
			const result = await response.json();
			if (!response.ok) {
				alert(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
			} else {
				alert('✅ Mot de passe modifié avec succès');
				window.history.pushState({}, '', '/profil');
				window.dispatchEvent(new PopStateEvent('popstate'));
			}
		} catch (err) {
			console.error('Erreur réseau ou serveur', err);
			alert('❌ Erreur lors de la modification du mot de passe');
		}
	});
}

export { initializeChangePasswordEvents }; 