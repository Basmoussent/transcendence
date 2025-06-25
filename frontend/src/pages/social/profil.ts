import { getAuthToken, removeAuthToken } from '../../utils/auth';
import { t } from '../../utils/translations';

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
          <button class="action-button logout">
            <i class="fas fa-sign-out-alt"></i>
            ${t('profile.logout')}
          </button>
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
  }, 0);

  return htmlContent;
}