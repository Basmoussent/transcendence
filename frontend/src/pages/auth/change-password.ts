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
					<a href="/profil" class="back-to-profile">${t('auth.changePassword.backToProfile') || 'Retour au profil'}</a>
				</div>
			</div>
		</main>
	</div>
	`;
}

document.addEventListener('DOMContentLoaded', () => {
	const changePasswordForm = document.getElementById('changePasswordForm');
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
				window.location.href = '/login';
				return;
			}
			const response = await fetch('http://localhost:8000/edit/change-password', {
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
				window.location.href = "/profil";
			}
		} catch (err) {
			console.error('Erreur réseau ou serveur', err);
			alert('❌ Erreur lors de la modification du mot de passe');
		}
	});
}); 