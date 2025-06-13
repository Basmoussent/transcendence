import { t } from '../../utils/translations';

export function renderMain() {
  return `
    <div class="main-menu">
      <div class="menu-container">
        <h1 class="menu-title">${t('menu.title')}</h1>
        
        <div class="menu-buttons">
          <button class="menu-button profile-button" onclick="window.location.href='/profil'">
            <i class="fas fa-user"></i>
            ${t('menu.profile')}
          </button>
          
          <button class="menu-button local-game-button" onclick="window.location.href='/local-game'">
            <i class="fas fa-gamepad"></i>
            ${t('menu.playLocal')}
          </button>
          
          <button class="menu-button multiplayer-button" onclick="window.location.href='/multiplayer'">
            <i class="fas fa-users"></i>
            ${t('menu.multiplayer')}
          </button>
          
          <button class="menu-button friends-button" onclick="window.location.href='/friends'">
            <i class="fas fa-user-friends"></i>
            ${t('menu.friends')}
          </button>
        </div>
      </div>
    </div>

    <style>
      .main-menu {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 20px;
      }

      .menu-container {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        width: 100%;
        max-width: 500px;
      }

      .menu-title {
        color: #fff;
        text-align: center;
        font-size: 2.5em;
        margin-bottom: 40px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .menu-buttons {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .menu-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 15px 25px;
        border: none;
        border-radius: 12px;
        font-size: 1.2em;
        font-weight: 600;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .menu-button:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .menu-button:active {
        transform: translateY(0);
      }

      .menu-button i {
        font-size: 1.2em;
      }

      /* Styles spécifiques pour chaque bouton */
      .profile-button {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      }

      .local-game-button {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      }

      .multiplayer-button {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      }

      .friends-button {
        background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      }

      /* Animation d'entrée */
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

      .menu-container {
        animation: fadeIn 0.5s ease-out;
      }

      /* Responsive design */
      @media (max-width: 600px) {
        .menu-container {
          padding: 20px;
        }

        .menu-title {
          font-size: 2em;
        }

        .menu-button {
          padding: 12px 20px;
          font-size: 1em;
        }
      }
    </style>
  `;
}
