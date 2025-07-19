import { getAuthToken, removeAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';
import { userInfo, update2FAState } from './utils';

export async function renderMe() {
	let userData = {
		username: 'Username',
		email: 'email@example.com',
		avatar: 'avatar.png',
		wins: 0,
		games: 0,
		rating: 0,
		preferred_language: 'en',
		twoFactorEnabled: false // Ajout du champ 2FA
	};

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch('/api/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			}
		});

		if (response.ok) {
			const result = await response.json();
			userData = {
				username: sanitizeHtml(result.user?.username) || 'Username',
				email: sanitizeHtml(result.user?.email) || 'email@example.com',
				avatar: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				wins: (result.stats?.win) || 0,
				games: (result.stats?.games) || 0,
				rating: (result.stats?.rating) || 0,
				preferred_language: sanitizeHtml(result.user?.language) || 'en',
				twoFactorEnabled: result.user?.two_fact_auth || false // Récupération du statut 2FA
			};
		} else {
			console.error('Erreur lors de la récupération des données utilisateur');
		}
	} catch (error) {
		console.error("Error rendering profile page:", error);
	}

	// Construire l'URL de l'avatar
	const avatarUrl = userData.avatar.startsWith('http') || userData.avatar.startsWith('/api/')
		? userData.avatar
		: `/api/uploads/${userData.avatar}`;

	// Déterminer le texte et l'icône du bouton 2FA
	const tfaButtonText = userData.twoFactorEnabled ? 'Deactivate 2FA' : 'Activate 2FA';
	const tfaButtonIcon = userData.twoFactorEnabled ? 'fa-solid fa-lock-open' : 'fa-solid fa-lock';

	const htmlContent = `
		<div class="profile-wrapper">
			<div class="profile-container">
				<div class="profile-header">
					<button class="home-button" id="homeBtn">
							<i class="fas fa-home"></i>
							Home
					</button>
					<div class="profile-avatar">
						<img src="${avatarUrl}" alt="Profile Avatar" class="avatar-image" onerror="this.src='../../public/avatar.png'">
						<button class="change-avatar-btn" id="changeAvatarBtn">
							<i class="fas fa-camera"></i>
						</button>
						<input type="file" id="avatarInput" accept="image/*" style="display: none;">
					</div>
					<div class="profile-info">
						<h1 class="username">${userData.username}</h1>
						<p class="email">${userData.email}</p>
						<div class="status online">
							<i class="fas fa-circle"></i> Online
						</div>
					</div>
					<button class="action-button logout">
						<i class="fas fa-sign-out-alt"></i>
						${t('profile.logout')}
					</button>
				</div>

				<div class="profile-stats">
					<div class="stat-card">
						<i class="fas fa-trophy"></i>
						<div class="stat-info">
							<span class="stat-value">${userData.wins}</span>
							<span class="stat-label">${t('profile.stats.wins')}</span>
						</div>
					</div>
					<div class="stat-card">
						<i class="fas fa-gamepad"></i>
						<div class="stat-info">
							<span class="stat-value">${userData.games}</span>
							<span class="stat-label">${t('profile.stats.games')}</span>
						</div>
					</div>
					<div class="stat-card">
						<i class="fas fa-star"></i>
						<div class="stat-info">
							<span class="stat-value">${userData.rating}</span>
							<span class="stat-label">${t('profile.stats.rating')}</span>
						</div>
					</div>
				</div>

				<div class="profile-actions">
					<button class="action-button edit-profile">
						<i class="fas fa-edit"></i>
						${t('profile.editProfile')}
					</button>
					<button class="action-button change-password">
						<i class="fas fa-key"></i>
						${t('profile.changePassword')}
					</button>
					<button class="action-button TFA-button" id="TFABtn" data-enabled="${userData.twoFactorEnabled}">
						<i class="fa-solid ${tfaButtonIcon}"></i>
						${tfaButtonText}
					</button>
				</div>
			</div>
		</div>

		<style>

			.profile-wrapper {
				height: 100vh;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.profile-page {
				min-height: 100vh;
				background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
				padding: 20px;
				position: relative;
				overflow: auto;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.background-circles {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 1;
				pointer-events: none;
			}

			.circle {
				position: absolute;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.05);
				backdrop-filter: blur(5px);
			}

			.circle-1 {
				width: 300px;
				height: 300px;
				top: -100px;
				left: -100px;
				background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(53, 122, 189, 0.1) 100%);
			}

			.circle-2 {
				width: 200px;
				height: 200px;
				top: 50%;
				right: -50px;
				background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%);
			}

			.circle-3 {
				width: 250px;
				height: 250px;
				bottom: -100px;
				left: 20%;
				background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
			}

			.circle-4 {
				width: 150px;
				height: 150px;
				top: 20%;
				left: 30%;
				background: linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%);
			}

			.profile-container {
				position: relative;
				z-index: 2;
				width: 90%;
				max-width: 800px;
				background: rgba(255, 255, 255, 0.1);
				backdrop-filter: blur(10px);
				border-radius: 20px;
				padding: 30px;
				box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
				border: 1px solid rgba(255, 255, 255, 0.18);
				animation: fadeIn 0.5s ease-out;
				overflow: auto;
			}

			.profile-header {
				display: flex;
				align-items: center;
				gap: 30px;
				margin-bottom: 40px;
			}

			.home-button {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 10px 20px;
				border: none;
				border-radius: 10px;
				background: rgba(255, 255, 255, 0.1);
				color: white;
				cursor: pointer;
				transition: all 0.3s ease;
			}

			.home-button:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: translateY(-2px);
			}

			.profile-avatar {
				position: relative;
			}

			.avatar-image {
				width: 120px;
				height: 120px;
				border-radius: 50%;
				border: 4px solid rgba(255, 255, 255, 0.2);
				object-fit: cover;
			}

			.change-avatar-btn {
				position: absolute;
				bottom: 0;
				right: 0;
				background: #4a90e2;
				border: none;
				border-radius: 50%;
				width: 35px;
				height: 35px;
				color: white;
				cursor: pointer;
				transition: all 0.3s ease;
			}

			.change-avatar-btn:hover {
				transform: scale(1.1);
			}

			.profile-info {
				color: white;
			}

			.username {
				font-size: 2em;
				margin: 0;
				text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
			}

			.email {
				color: #ccc;
				margin: 5px 0;
			}

			.status {
				display: inline-flex;
				align-items: center;
				gap: 5px;
				padding: 5px 10px;
				border-radius: 15px;
				font-size: 0.9em;
			}

			.status.online {
				background: rgba(46, 204, 113, 0.2);
				color: #2ecc71;
			}

			.profile-stats {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 15px;
				margin-bottom: 30px;
			}

			.stat-card {
				background: rgba(255, 255, 255, 0.05);
				border-radius: 15px;
				padding: 15px;
				display: flex;
				align-items: center;
				gap: 15px;
				color: white;
			}

			.stat-card i {
				font-size: 1.5em;
				color: #4a90e2;
			}

			.stat-info {
				display: flex;
				flex-direction: column;
			}

			.stat-value {
				font-size: 1.3em;
				font-weight: bold;
			}

			.stat-label {
				color: #ccc;
				font-size: 0.9em;
			}

			.profile-actions {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 15px;
				margin-bottom: 30px;
			}

			.action-button {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8px;
				padding: 10px;
				border: none;
				border-radius: 12px;
				color: white;
				cursor: pointer;
				transition: all 0.3s ease;
				font-weight: 600;
				font-size: 0.9em;
			}

			.edit-profile {
				background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
			}

			.change-password {
				background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
			}

			.TFA-button {
				background: linear-gradient(135deg, #f39c12 0%, #d68910 100%);
			}

			.TFA-button[data-enabled="true"] {
				background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
			}

			.logout {
				background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
			}

			.action-button:hover {
				transform: translateY(-2px);
				box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}

			@media (max-width: 768px) {
				.profile-container {
					padding: 20px;
				}

				.profile-header {
					flex-direction: column;
					text-align: center;
					gap: 20px;
				}

				.home-button {
					width: 100%;
					justify-content: center;
				}

				.profile-stats {
					grid-template-columns: 1fr;
				}

				.profile-actions {
					grid-template-columns: 1fr;
				}

				.username {
					font-size: 1.8em;
				}

				.avatar-image {
					width: 100px;
					height: 100px;
				}
			}

			@media (max-width: 480px) {
				.profile-container {
					padding: 15px;
				}

				.username {
					font-size: 1.5em;
				}

				.avatar-image {
					width: 80px;
					height: 80px;
				}

				.change-avatar-btn {
					width: 30px;
					height: 30px;
				}
			}
		</style>
	`;

	setTimeout(() => {
		const logoutButton = document.querySelector('.action-button.logout');
		const editProfileButton = document.querySelector('.action-button.edit-profile');
		const changePasswordButton = document.querySelector('.action-button.change-password');
		const changeAvatarBtn = document.getElementById('changeAvatarBtn');
		const avatarInput = document.getElementById('avatarInput') as HTMLInputElement;
		const homeBtn = document.getElementById('homeBtn');
		const TFABtn = document.getElementById('TFABtn');
	
		if (homeBtn) {
			homeBtn.addEventListener('click', () => {
				window.history.pushState({}, '', '/main');
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
		}

		if (logoutButton) {
			logoutButton.addEventListener('click', () => {
				removeAuthToken();
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
		}

		if (editProfileButton) {
			editProfileButton.addEventListener('click', () => {
				window.history.pushState({}, '', '/edit-profil');
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
		}

		if (changePasswordButton) {
			changePasswordButton.addEventListener('click', () => {
				window.history.pushState({}, '', '/change-password');
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
		}

		// Gestion bouton 2FA
		if (TFABtn) {
			TFABtn.addEventListener('click', async () => {
			
			console.log('iqubwiduqbwiudbqiwudbq')
			const info = await userInfo();

			if (info.user.two_fact_auth) {
				// desactiver 2FA
				const confirmation = confirm('Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ?');
				
				if (confirmation) {
					const success = await update2FAState(0, info.user.id);

					if (success) {
						TFABtn.innerHTML = '<i class="fa-solid fa-lock"></i> Activate 2FA';
						alert('✅ 2FA désactivée avec succès');
					}
					else
						alert('❌ Erreur lors de la désactivation 2FA');
				}
			}
			else {
				// activer 2FA
				window.history.pushState({}, '', '/2fa');
				window.dispatchEvent(new PopStateEvent('popstate'));
			}});
		}

		// Gestion de l'upload d'avatar
		if (changeAvatarBtn && avatarInput) {
			changeAvatarBtn.addEventListener('click', () => {
				avatarInput.click();
			});

			avatarInput.addEventListener('change', async (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (!file) return;

				// Vérifier le type de fichier
				if (!file.type.startsWith('image/')) {
					alert('❌ Veuillez sélectionner une image valide');
					return;
				}

				// Vérifier la taille (5MB max)
				if (file.size > 5 * 1024 * 1024) {
					alert('❌ L\'image est trop volumineuse. Taille maximum: 5MB');
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
						alert('✅ Avatar mis à jour avec succès');
						// Recharger la page pour afficher le nouvel avatar
						window.location.reload();
					} else {
						alert(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
					}
				} catch (err) {
					console.error('Erreur lors de l\'upload:', err);
					alert('❌ Erreur lors de l\'upload de l\'avatar');
				}
			});
		}
	}, 0);

	return htmlContent;
}
