import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';

export async function renderFriends(uuid: string){
  // Données d'exemple pour un ami (à remplacer par un appel API réel)
  let friendData = {
    username: 'FriendUsername',
    avatar: 'avatar3.png',
    wins: 15,
    games: 25,
    rating: 1250,
    status: 'online'
  };

  // TODO: Récupérer l'ID de l'ami depuis l'URL ou les paramètres
  // const friendId = getFriendIdFromUrl();
  
  try {
    // TODO: Remplacer par un vrai appel API pour récupérer les données de l'ami
    // const response = await fetch(`/api/friends/${friendId}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'x-access-token': token
    //   }
    // });
    
    // if (response.ok) {
    //   const result = await response.json();
    //   friendData = {
    //     username: sanitizeHtml(result.username) || 'FriendUsername',
    //     avatar: sanitizeHtml(result.avatar_url) || 'avatar.png',
    //     wins: (result.stats?.wins) || 0,
    //     games: (result.stats?.games) || 0,
    //     rating: (result.stats?.rating) || 0,
    //     status: result.status || 'offline',
    //     lastSeen: result.last_seen || 'Unknown'
    //   };
    // } else {
    //   console.error('Erreur lors de la récupération des données de l\'ami');
    // }
  } catch (error) {
    console.error("Error rendering friend profile page:", error);
  }

  // Construire l'URL de l'avatar
  const avatarUrl = friendData.avatar.startsWith('http') || friendData.avatar.startsWith('/api/') 
    ? friendData.avatar 
    : `../uploads/${friendData.avatar}`;

  const htmlContent = `
    <div class="friend-profile-page">
      <div class="background-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>
      
      <div class="friend-profile-container">
        <div class="friend-profile-header">
          <button class="back-button" id="backButton">
            <i class="fas fa-arrow-left"></i>
            ${t('friends.backToSocial') || 'Retour'}
          </button>
          
          <div class="friend-profile-avatar">
            <img src="${avatarUrl}" alt="Friend Avatar" class="avatar-image" onerror="this.src='../../public/avatar.png'">
            <div class="status-indicator ${friendData.status}">
              <i class="fas fa-circle"></i>
            </div>
          </div>
          
          <div class="friend-profile-info">
            <h1 class="friend-username">${friendData.username}</h1>
            <div class="friend-status ${friendData.status}">
              <i class="fas fa-circle"></i>
              ${friendData.status === 'online' ? (t('friends.online') || 'En ligne') : (t('friends.offline') || 'Hors ligne')}
              ${friendData.status === 'offline' ? ` - ${t('friends.lastSeen') || 'Vu'} ${friendData.lastSeen}` : ''}
            </div>
          </div>
        </div>

        <div class="friend-profile-stats">
          <div class="stat-card">
            <i class="fas fa-trophy"></i>
            <div class="stat-info">
              <span class="stat-value">${friendData.wins}</span>
              <span class="stat-label">${t('friends.stats.wins') || 'Victoires'}</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-gamepad"></i>
            <div class="stat-info">
              <span class="stat-value">${friendData.games}</span>
              <span class="stat-label">${t('friends.stats.games') || 'Parties'}</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-star"></i>
            <div class="stat-info">
              <span class="stat-value">${friendData.rating}</span>
              <span class="stat-label">${t('friends.stats.rating') || 'Classement'}</span>
            </div>
          </div>
        </div>

        <div class="friend-profile-actions">
          <button class="action-button send-message" id="sendMessageBtn">
            <i class="fas fa-comment"></i>
            ${t('friends.sendMessage') || 'Envoyer un message'}
          </button>
          <button class="action-button invite-game" id="inviteGameBtn" ${friendData.status === 'offline' ? 'disabled' : ''}>
            <i class="fas fa-gamepad"></i>
            ${t('friends.inviteToGame') || 'Inviter à jouer'}
          </button>
          <button class="action-button remove-friend" id="removeFriendBtn">
            <i class="fas fa-user-minus"></i>
            ${t('friends.removeFriend') || 'Retirer des amis'}
          </button>
        </div>
      </div>
    </div>

    <style>
      .friend-profile-page {
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

      .friend-profile-container {
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

      .back-button {
        position: absolute;
        top: 20px;
        left: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 15px;
        border: none;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9em;
        text-decoration: none;
      }

      .back-button:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-2px);
      }

      .friend-profile-header {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-bottom: 40px;
        margin-top: 20px;
      }

      .friend-profile-avatar {
        position: relative;
      }

      .avatar-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 4px solid rgba(255, 255, 255, 0.2);
        object-fit: cover;
      }

      .status-indicator {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .status-indicator.online {
        background: #2ecc71;
      }

      .status-indicator.offline {
        background: #95a5a6;
      }

      .status-indicator i {
        color: white;
        font-size: 0.8em;
      }

      .friend-profile-info {
        color: white;
        flex: 1;
      }

      .friend-username {
        font-size: 2em;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .friend-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.9em;
        margin-top: 5px;
      }

      .friend-status.online {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }

      .friend-status.offline {
        background: rgba(149, 165, 166, 0.2);
        color: #95a5a6;
      }

      .friend-profile-stats {
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

      .friend-profile-actions {
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
        padding: 12px;
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        font-size: 0.9em;
      }

      .action-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .send-message {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      }

      .invite-game {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      }

      .remove-friend {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      }

      .action-button:hover:not(:disabled) {
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
        .friend-profile-container {
          padding: 20px;
        }

        .friend-profile-header {
          flex-direction: column;
          text-align: center;
          gap: 20px;
        }

        .friend-profile-stats {
          grid-template-columns: 1fr;
        }

        .friend-profile-actions {
          grid-template-columns: 1fr;
        }

        .friend-username {
          font-size: 1.8em;
        }

        .avatar-image {
          width: 100px;
          height: 100px;
        }

        .back-button {
          position: relative;
          top: auto;
          left: auto;
          align-self: flex-start;
          margin-bottom: 20px;
        }
      }

      @media (max-width: 480px) {
        .friend-profile-container {
          padding: 15px;
        }

        .friend-username {
          font-size: 1.5em;
        }

        .avatar-image {
          width: 80px;
          height: 80px;
        }

        .status-indicator {
          width: 20px;
          height: 20px;
        }
      }
    </style>
  `;

  setTimeout(() => {
    const backButton = document.getElementById('backButton');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const inviteGameBtn = document.getElementById('inviteGameBtn');
    const removeFriendBtn = document.getElementById('removeFriendBtn');

    if (backButton) {
      backButton.addEventListener('click', () => {
        window.history.pushState({}, '', '/social');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    }

    if (sendMessageBtn) {
      sendMessageBtn.addEventListener('click', () => {
        // TODO: Implémenter l'envoi de message
        alert('Fonctionnalité de message à implémenter');
      });
    }

    if (inviteGameBtn) {
      inviteGameBtn.addEventListener('click', () => {
        if (friendData.status === 'online') {
          // TODO: Implémenter l'invitation à jouer
          alert('Invitation à jouer envoyée !');
        }
      });
    }

    if (removeFriendBtn) {
      removeFriendBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir retirer cet ami de votre liste d\'amis ?')) {
          // TODO: Implémenter la suppression d'ami
          alert('Ami retiré de la liste');
          window.history.pushState({}, '', '/social');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      });
    }
  }, 0);

  return htmlContent;
}
