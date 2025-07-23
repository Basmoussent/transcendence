import { t } from '../../utils/translations';
import { getAuthToken, setAuthToken } from '../../utils/auth';
import { addEvent } from '../../utils/eventManager';

export function renderEditProfil(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
						<h2>${t('profile.edit.title' as any) || 'Modifier le profil'}</h2>
		<form id="editProfilForm" class="login-form">
			<div class="form-group">
				<label for="username">${t('profile.edit.username' as any) || 'Nom d\'utilisateur'}</label>
				<input id="username" name="username" placeholder="${t('profile.edit.username' as any) || 'Nom d\'utilisateur'}" required autocomplete="username">
			</div>
			<div class="form-group">
				<label for="avatar">${t('profile.edit.avatar' as any) || 'Avatar'}</label>
				<div class="avatar-selection">
					<div class="avatar-option custom-upload">
						<input type="radio" id="customAvatar" name="avatar" value="custom">
						<label for="customAvatar" class="custom-upload-label">
							<div class="upload-icon">
								<i class="fas fa-upload"></i>
							</div>
							<span class="upload-text">${t('social.upload' as any)}</span>
						</label>
						<input type="file" id="customAvatarInput" accept="image/*" style="display: none;">
					</div>
				</div>
			</div>
			<button type="submit" class="login-btn">${t('profile.edit.submit' as any) || 'Enregistrer'}</button>
		</form>
		<div class="login-options">
			<button id="backToProfileBtn" class="back-to-profile-btn">
				${t('profile.edit.backToProfile' as any) || 'Annuler'}
					</button>
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
			flex-wrap: wrap;
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

		.custom-upload-label {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: white;
			font-size: 0.8em;
		}

		.upload-icon {
			font-size: 1.2em;
			margin-bottom: 2px;
		}

		.upload-text {
			font-size: 0.7em;
		}

		.form-group label {
			display: block;
			margin-bottom: 5px;
			color: #333;
			font-weight: 500;
		}

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

function initializeEditProfileEvents() {
	const editProfilForm = document.getElementById('editProfilForm');
	const customAvatarInput = document.getElementById('customAvatarInput') as HTMLInputElement;
	const customAvatarRadio = document.getElementById('customAvatar') as HTMLInputElement;
	const backToProfileBtn = document.getElementById('backToProfileBtn');

	if (backToProfileBtn) {
		backToProfileBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/me');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}

	// Gestion de l'upload d'image personnalisée
	if (customAvatarInput && customAvatarRadio) {
		addEvent(customAvatarInput, 'change', async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			// Vérifier le type de fichier
			if (!file.type.startsWith('image/')) {
				alert('❌ ' + t('social.selectValidImage' as any));
				return;
			}

			// Vérifier la taille (5MB max)
			if (file.size > 5 * 1024 * 1024) {
				alert('❌ ' + t('social.imageTooLarge' as any));
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

				const formData = new FormData();
				formData.append('file', file);

				const response = await fetch('/api/upload/avatar', {
					method: 'POST',
					headers: {
						'x-access-token': token
					},
					body: formData
				});

				const result = await response.json();
				
				if (response.ok) {
					// Mettre à jour le token si un nouveau est fourni
					
					
					alert('✅ ' + t('social.avatarUploadSuccess' as any));
					// Rediriger vers la page de profil avec le router SPA
					window.history.pushState({}, '', '/me');
					window.dispatchEvent(new PopStateEvent('popstate'));
				} else {
					alert(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
				}
			} catch (err) {
				console.error('Erreur lors de l\'upload:', err);
				alert('❌ ' + t('social.avatarUploadError' as any));
			}
		});

		// Quand on clique sur l'option custom, déclencher l'input file
		if (customAvatarRadio) {
			addEvent(customAvatarRadio as HTMLElement, 'change', () => {
				if (customAvatarRadio.checked && customAvatarInput) {
					customAvatarInput.click();
				}
			});
		}
	}

	addEvent(editProfilForm, 'submit', async (e) => {
		e.preventDefault();
		const username = (document.getElementById('username') as HTMLInputElement).value;
		const selectedAvatar = (document.querySelector('input[name="avatar"]:checked') as HTMLInputElement)?.value || 'avatar.png';
		
		if (selectedAvatar === 'custom') {
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

			const response = await fetch('/api/edit/profile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token
				},
				body: JSON.stringify({ 
					username, 
					avatar_url: selectedAvatar 
				})
			});
			const result = await response.json();
			if (!response.ok) {
				alert(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
			} else {
				// Mettre à jour le token si un nouveau est fourni
				const token = response.headers.get('x-access-token');
				console.log("token", JSON.stringify(response.headers));
				if (token) {
					console.log('🎫 Token reçu dans le header');
					setAuthToken(token);
					console.log(`le token des familles `, token)
				}
				else
					console.log('Token attendu dans les cookies');
				
				alert('✅ Profil modifié avec succès');
				window.history.pushState({}, '', '/me');
				window.dispatchEvent(new PopStateEvent('popstate'));
			}
		} catch (err) {
			console.error('Erreur réseau ou serveur', err);
			alert('❌ Erreur lors de la modification du profil');
		}
	});
}

// Exporter la fonction d'initialisation pour qu'elle puisse être appelée après le rendu
export { initializeEditProfileEvents }; 