import { getAuthToken, removeAuthToken } from '../../utils/auth';

export async function renderProfil() {
  let userData = {
    username: 'Username',
    email: 'email@example.com',
    avatar: 'avatar.png',
    wins: 0,
    games: 0,
    rating: 0,
    preferred_language: 'en'
  };

  try {
    const token = getAuthToken();
    if (!token) {
      alert('❌ Token d\'authentification manquant');
      window.location.href = '/login';
      return '';
    }

    const response = await fetch('http://localhost:8000/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      userData = {
        username: result.user?.username || 'Username',
        email: result.user?.email || 'email@example.com',
        avatar: result.user?.avatar_url || 'avatar.png',
        wins: result.stats?.wins || 0,
        games: result.stats?.games || 0,
        rating: result.stats?.rating || 0,
        preferred_language: result.user?.language || 'en'
      };
    } else {
      console.error('Erreur lors de la récupération des données utilisateur');
    }
  } catch (error) {
    console.error("Error rendering profile page:", error);
  }

  const htmlContent = `
    <div class="profile-page">
      <div class="background-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar">
            <img src="../../public/${userData.avatar}" alt="Profile Avatar" class="avatar-image">
            <button class="change-avatar-btn">
              <i class="fas fa-camera"></i>
            </button>
          </div>
          <div class="profile-info">
            <h1 class="username">${userData.username}</h1>
            <p class="email">${userData.email}</p>
            <div class="status online">
              <i class="fas fa-circle"></i> Online
            </div>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <i class="fas fa-trophy"></i>
            <div class="stat-info">
              <span class="stat-value">${userData.wins}</span>
              <span class="stat-label">Wins</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-gamepad"></i>
            <div class="stat-info">
              <span class="stat-value">${userData.games}</span>
              <span class="stat-label">Games</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-star"></i>
            <div class="stat-info">
              <span class="stat-value">${userData.rating}</span>
              <span class="stat-label">Rating</span>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button class="action-button edit-profile">
            <i class="fas fa-edit"></i>
            Edit Profile
          </button>
          <button class="action-button change-password">
            <i class="fas fa-key"></i>
            Change Password
          </button>
          <button class="action-button logout">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <div class="profile-preferences">
          <h2><i class="fas fa-cog"></i> Préférences</h2>
          <div class="preference-card">
            <div class="preference-header">
              <i class="fas fa-language"></i>
              <div class="preference-info">
                <span class="preference-title">Langue par défaut</span>
                <span class="preference-description">Choisissez votre langue préférée pour l'interface</span>
              </div>
            </div>
            <div class="language-selector-profile">
              <button class="language-option ${userData.preferred_language === 'fr' ? 'active' : ''}" data-lang="fr">
                <span class="flag fr-flag"></span>
                <span class="lang-text">Français</span>
              </button>
              <button class="language-option ${userData.preferred_language === 'en' ? 'active' : ''}" data-lang="en">
                <span class="flag en-flag"></span>
                <span class="lang-text">English</span>
              </button>
              <button class="language-option ${userData.preferred_language === 'es' ? 'active' : ''}" data-lang="es">
                <span class="flag es-flag"></span>
                <span class="lang-text">Español</span>
              </button>
            </div>
            <button class="save-language-btn">
              <i class="fas fa-save"></i>
              Sauvegarder la langue
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
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

      .profile-avatar {
        position: relative;
      }

      .avatar-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 4px solid rgba(255, 255, 255, 0.2);
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

      .logout {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      }

      .action-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .profile-preferences {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
      }

      .preference-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 15px;
        margin-bottom: 20px;
      }

      .preference-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
      }

      .preference-header i {
        font-size: 1.5em;
        color: #4a90e2;
      }

      .preference-info {
        display: flex;
        flex-direction: column;
      }

      .preference-title {
        font-size: 1.2em;
        margin-bottom: 5px;
      }

      .preference-description {
        color: #ccc;
        font-size: 0.9em;
      }

      .language-selector-profile {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }

      .flag {
        width: 24px;
        height: 16px;
        margin-right: 8px;
        border-radius: 2px;
        display: inline-block;
      }

      .fr-flag {
        background: linear-gradient(to right, #002395 33%, #fff 33%, #fff 66%, #ed2939 66%);
      }

      .en-flag {
        background: linear-gradient(45deg, #012169 25%, transparent 25%), 
                    linear-gradient(-45deg, #012169 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #012169 75%), 
                    linear-gradient(-45deg, transparent 75%, #012169 75%);
        background-size: 8px 8px;
        background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        background-color: #c8102e;
      }

      .es-flag {
        background: linear-gradient(to bottom, #c60b1e 50%, #ffc400 50%);
      }

      .lang-text {
        font-weight: 600;
        color: white;
      }

      .language-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid transparent;
        border-radius: 10px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9em;
      }

      .language-option:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      .language-option.active {
        border-color: #4a90e2;
        background: rgba(74, 144, 226, 0.2);
        box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
      }

      .save-language-btn {
        background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .save-language-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .save-language-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
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

        .profile-stats {
          grid-template-columns: 1fr;
        }

        .profile-actions {
          grid-template-columns: 1fr;
        }

        .language-selector-profile {
          flex-direction: column;
          gap: 10px;
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

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        removeAuthToken();
        window.location.href = '/login';
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

    const saveLanguageBtn = document.querySelector('.save-language-btn') as HTMLButtonElement;
    const languageOptions = document.querySelectorAll('.language-option');

    languageOptions.forEach(option => {
      option.addEventListener('click', () => {
        languageOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      });
    });

    if (saveLanguageBtn) {
      saveLanguageBtn.addEventListener('click', async () => {
        const token = getAuthToken();
        if (!token) return;

        const selectedLanguage = (document.querySelector('.language-option.active') as HTMLButtonElement)?.dataset.lang;
        if (!selectedLanguage) {
          alert('❌ Veuillez sélectionner une langue');
          return;
        }

        saveLanguageBtn.disabled = true;
        saveLanguageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';

        try {
          const response = await fetch('http://localhost:8000/edit/change-language', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            },
            body: JSON.stringify({
              language: selectedLanguage
            })
          });

          if (response.ok) {
            saveLanguageBtn.innerHTML = '<i class="fas fa-check"></i> Sauvegardé !';
            setTimeout(() => {
              const hostname = window.location.hostname;
              const parts = hostname.split('.');
              const newHostname = `${selectedLanguage}.${parts.slice(1).join('.')}`;
              window.location.href = `${window.location.protocol}//${newHostname}${window.location.pathname}`;
            }, 1000);
          } else {
            throw new Error('Erreur de sauvegarde');
          }
        } catch (error) {
          console.error('Erreur:', error);
          saveLanguageBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur';
          setTimeout(() => {
            saveLanguageBtn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder la langue';
            saveLanguageBtn.disabled = false;
          }, 2000);
        }
      });
    }
  }, 0);

  return htmlContent;
}