import { t } from '../../utils/translations';

export function renderEditProfil(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('profile.edit.title') || 'Modifier le profil'}</h2>
				<form id="editProfilForm" class="login-form">
					<div class="form-group">
						<label for="email">${t('profile.edit.email') || 'Email'}</label>
						<input type="email" id="email" name="email" placeholder="${t('profile.edit.email') || 'Email'}" required>
					</div>
					<div class="form-group">
						<label for="avatar">${t('profile.edit.avatar') || 'Avatar'}</label>
						<div class="avatar-selection">
							<div class="avatar-option">
								<input type="radio" id="avatar1" name="avatar" value="avatar.png" checked>
								<label for="avatar1">
									<img src="../../public/avatar.png" alt="Avatar 1" class="avatar-preview">
								</label>
							</div>
							<div class="avatar-option">
								<input type="radio" id="avatar2" name="avatar" value="avatar1.png">
								<label for="avatar2">
									<img src="../../public/avatar1.png" alt="Avatar 2" class="avatar-preview">
								</label>
							</div>
							<div class="avatar-option">
								<input type="radio" id="avatar3" name="avatar" value="avatar2.png">
								<label for="avatar3">
									<img src="../../public/avatar2.png" alt="Avatar 3" class="avatar-preview">
								</label>
							</div>
							<div class="avatar-option">
								<input type="radio" id="avatar4" name="avatar" value="avatar3.png">
								<label for="avatar4">
									<img src="../../public/avatar3.png" alt="Avatar 4" class="avatar-preview">
								</label>
							</div>
						</div>
					</div>
					<button type="submit" class="login-btn">${t('profile.edit.submit') || 'Enregistrer'}</button>
				</form>
				<div class="login-options">
					<a href="/social/profil" class="back-to-profile">${t('profile.edit.backToProfile') || 'Annuler'}</a>
				</div>
			</div>
		</main>
	</div>

	<style>
		.avatar-selection {
			display: flex;
			gap: 15px;
			margin-top: 10px;
			justify-content: center;
		}

		.avatar-option {
			text-align: center;
		}

		.avatar-option input[type="radio"] {
			display: none;
		}

		.avatar-option label {
			cursor: pointer;
			display: block;
			border: 2px solid transparent;
			border-radius: 50%;
			transition: all 0.3s ease;
		}

		.avatar-option input[type="radio"]:checked + label {
			border-color: #4a90e2;
			transform: scale(1.1);
		}

		.avatar-preview {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			object-fit: cover;
		}

		.form-group label {
			display: block;
			margin-bottom: 5px;
			color: #333;
			font-weight: 500;
		}
	</style>
	`;
}

document.addEventListener('DOMContentLoaded', () => {
	const editProfilForm = document.getElementById('editProfilForm');
	editProfilForm?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const email = (document.getElementById('email') as HTMLInputElement).value;
		const selectedAvatar = (document.querySelector('input[name="avatar"]:checked') as HTMLInputElement)?.value || 'avatar.png';
		
		try {
			const token = localStorage.getItem('x-access-token');
			if (!token) {
				alert('❌ Token d\'authentification manquant');
				window.location.href = '/login';
				return;
			}

			const response = await fetch('http://localhost:8000/edit/profile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token
				},
				body: JSON.stringify({ 
					email, 
					avatar: selectedAvatar 
				})
			});
			const result = await response.json();
			if (!response.ok) {
				alert(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
			} else {
				alert('✅ Profil modifié avec succès');
				window.location.href = "/profil";
			}
		} catch (err) {
			console.error('Erreur réseau ou serveur', err);
			alert('❌ Erreur lors de la modification du profil');
		}
	});
}); 