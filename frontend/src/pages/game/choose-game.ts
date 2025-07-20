import { t } from '../../utils/translations';

export function renderChooseGame() {
  return `
    <div class="main-menu">
      <div class="menu-container">
        <h1 class="menu-title">${t('menu.title')}</h1>
        
        <div class="menu-buttons">

          <button class="menu-button block-game-button" id="blockBtn">
            <i class="fas fa-cube"></i>
            ${t('game.blockGame')}
          </button>

          <button class="menu-button pong-game-button" id="pongBtn">
            <i class="fas fa-cube"></i>
            ${t('game.pongGame')}
          </button>
          
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
        padding: 30px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        width: 100%;
        max-width: 500px;
        animation: fadeIn 0.5s ease-out;
      }

      .menu-title {
        color: #fff;
        text-align: center;
        font-size: 2.2em;
        margin-bottom: 30px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .menu-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .menu-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 15px 20px;
        border: none;
        border-radius: 12px;
        font-size: 1.1em;
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
      .block-game-button {
        background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
      }

      .pong-game-button {
        background: linear-gradient(135deg, #ff8000 0%, #f39c12 100%);
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

      /* Desktop Layout */
      @media (min-width: 1024px) {
        .menu-container {
          padding: 40px;
        }

        .menu-title {
          font-size: 2.5em;
          margin-bottom: 40px;
        }

        .menu-button {
          padding: 20px 25px;
          font-size: 1.2em;
        }
      }

      /* Tablet Layout */
      @media (min-width: 768px) and (max-width: 1023px) {
        .menu-container {
          padding: 35px;
        }

        .menu-title {
          font-size: 2.3em;
        }

        .menu-button {
          padding: 18px 22px;
          font-size: 1.15em;
        }
      }

      /* Mobile Layout */
      @media (max-width: 767px) {
        .main-menu {
          padding: 15px;
        }

        .menu-container {
          padding: 25px;
        }

        .menu-title {
          font-size: 2em;
          margin-bottom: 25px;
        }

        .menu-button {
          padding: 12px 18px;
          font-size: 1em;
        }
      }

      /* Small Mobile Layout */
      @media (max-width: 480px) {
        .main-menu {
          padding: 10px;
        }

        .menu-container {
          padding: 20px;
        }

        .menu-title {
          font-size: 1.8em;
          margin-bottom: 20px;
        }

        .menu-button {
          padding: 10px 15px;
          font-size: 0.95em;
        }

        .menu-button i {
          font-size: 1.1em;
        }
      }
    </style>
  `;
}
