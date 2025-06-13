export function renderMultiplayer() {
  return `
    <div class="game-page">
      <div class="game-container">
        <div class="game-header">
          <button class="home-button" onclick="window.location.href='/main'">
            <i class="fas fa-home"></i>
            Home
          </button>
          <h1>Multiplayer Game</h1>
        </div>

        <div class="game-content">
          <div class="game-canvas-container">
            <canvas id="multiplayerCanvas"></canvas>
          </div>

          <div class="game-controls">
            <div class="player-info">
              <div class="player player1">
                <img src="../../public/avatar.png" alt="Player 1" class="player-avatar">
                <div class="player-details">
                  <span class="player-name">Player 1</span>
                  <span class="player-score">0</span>
                </div>
              </div>
              <div class="vs">VS</div>
              <div class="player player2">
                <img src="../../public/avatar.png" alt="Player 2" class="player-avatar">
                <div class="player-details">
                  <span class="player-name">Player 2</span>
                  <span class="player-score">0</span>
                </div>
              </div>
            </div>

            <div class="game-actions">
              <button class="action-button start-game">
                <i class="fas fa-play"></i>
                Start Game
              </button>
              <button class="action-button invite-friend">
                <i class="fas fa-user-plus"></i>
                Invite Friend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .game-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        overflow-y: auto;
      }

      .game-container {
        width: 95%;
        max-width: 1200px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        animation: fadeIn 0.5s ease-out;
        margin: 20px 0;
      }

      .game-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
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

      .game-header h1 {
        color: white;
        margin: 0;
        font-size: 1.8em;
      }

      .game-content {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .game-canvas-container {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        overflow: hidden;
        aspect-ratio: 16/9;
      }

      #multiplayerCanvas {
        width: 100%;
        height: 100%;
        display: block;
      }

      .game-controls {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .player-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
      }

      .player {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .player-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
        object-fit: cover;
      }

      .player-details {
        display: flex;
        flex-direction: column;
      }

      .player-name {
        color: white;
        font-weight: 600;
        font-size: 0.95em;
      }

      .player-score {
        color: #4a90e2;
        font-size: 1.1em;
        font-weight: bold;
      }

      .vs {
        color: white;
        font-size: 1.3em;
        font-weight: bold;
      }

      .game-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px;
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.95em;
      }

      .start-game {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      }

      .invite-friend {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
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

      /* Desktop Layout */
      @media (min-width: 1024px) {
        .game-container {
          padding: 30px;
        }

        .game-header h1 {
          font-size: 2.2em;
        }

        .game-content {
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }

        .player-avatar {
          width: 50px;
          height: 50px;
        }

        .player-name {
          font-size: 1.1em;
        }

        .player-score {
          font-size: 1.3em;
        }

        .vs {
          font-size: 1.5em;
        }

        .action-button {
          padding: 15px;
          font-size: 1.1em;
        }
      }

      /* Tablet Layout */
      @media (min-width: 768px) and (max-width: 1023px) {
        .game-container {
          padding: 25px;
        }

        .game-header h1 {
          font-size: 2em;
        }

        .game-content {
          gap: 25px;
        }

        .player-avatar {
          width: 45px;
          height: 45px;
        }
      }

      /* Mobile Layout */
      @media (max-width: 767px) {
        .game-page {
          padding: 15px;
        }

        .game-container {
          padding: 15px;
        }

        .game-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }

        .home-button {
          width: 100%;
          justify-content: center;
        }

        .game-header h1 {
          font-size: 1.6em;
          width: 100%;
          text-align: center;
        }

        .player-info {
          flex-direction: column;
          gap: 15px;
        }

        .vs {
          margin: 10px 0;
        }
      }

      /* Small Mobile Layout */
      @media (max-width: 480px) {
        .game-page {
          padding: 10px;
        }

        .game-container {
          padding: 12px;
        }

        .game-header h1 {
          font-size: 1.4em;
        }

        .player-avatar {
          width: 35px;
          height: 35px;
        }

        .player-name {
          font-size: 0.9em;
        }

        .player-score {
          font-size: 1em;
        }

        .vs {
          font-size: 1.2em;
        }

        .action-button {
          padding: 10px;
          font-size: 0.9em;
        }
      }
    </style>
  `;
} 