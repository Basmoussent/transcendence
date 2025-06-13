export function renderLocal() {
  return `
    <div class="game-page">
      <div class="game-container">
        <div class="game-header">
          <button class="home-button" onclick="window.location.href='/main'">
            <i class="fas fa-home"></i>
            Home
          </button>
          <h1>Local Game</h1>
        </div>

        <div class="game-content">
          <div class="game-canvas-container">
            <canvas id="localCanvas"></canvas>
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

            <div class="controls-info">
              <h3>Controls</h3>
              <div class="controls-grid">
                <div class="control-group">
                  <h4>Player 1</h4>
                  <p>W / S - Move Up/Down</p>
                </div>
                <div class="control-group">
                  <h4>Player 2</h4>
                  <p>↑ / ↓ - Move Up/Down</p>
                </div>
              </div>
            </div>

            <div class="game-actions">
              <button class="action-button start-game">
                <i class="fas fa-play"></i>
                Start Game
              </button>
              <button class="action-button reset-game">
                <i class="fas fa-redo"></i>
                Reset Game
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
        padding: 40px 20px;
      }

      .game-container {
        max-width: 1200px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .game-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
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
        font-size: 2em;
      }

      .game-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 30px;
      }

      .game-canvas-container {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        overflow: hidden;
      }

      #localCanvas {
        width: 100%;
        height: 500px;
        display: block;
      }

      .game-controls {
        display: flex;
        flex-direction: column;
        gap: 30px;
      }

      .player-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
      }

      .player {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .player-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .player-details {
        display: flex;
        flex-direction: column;
      }

      .player-name {
        color: white;
        font-weight: 600;
      }

      .player-score {
        color: #4a90e2;
        font-size: 1.2em;
        font-weight: bold;
      }

      .vs {
        color: white;
        font-size: 1.5em;
        font-weight: bold;
      }

      .controls-info {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 20px;
      }

      .controls-info h3 {
        color: white;
        margin: 0 0 15px 0;
        font-size: 1.2em;
      }

      .controls-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .control-group h4 {
        color: #4a90e2;
        margin: 0 0 10px 0;
      }

      .control-group p {
        color: white;
        margin: 0;
        font-size: 0.9em;
      }

      .game-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 15px;
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .start-game {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      }

      .reset-game {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      }

      .action-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      @media (max-width: 1024px) {
        .game-content {
          grid-template-columns: 1fr;
        }

        .game-canvas-container {
          order: 2;
        }

        .game-controls {
          order: 1;
        }
      }
    </style>
  `;
} 