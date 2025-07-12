import { MultiPong } from '../../game/pong/multiplayer/multi-pong';

export function renderMultiPong() {
  const html = `
    <div class="pong-game-container">
      <div class="game-wrapper">
        <canvas id="pongGameCanvas" width="800" height="800"></canvas>
      </div>
    </div>
    <style>
      .pong-game-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 20px;
      }
      .game-wrapper {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 90vmin;
        height: 90vmin;
      }
      #pongGameCanvas {
        width: 100%;
        height: 100%;
        display: block;
        background-color: #1a1a2e;
        border-radius: 5px;
      }
      
      /* Mobile Layout */
      @media (max-width: 767px) {
        .pong-game-container {
          padding: 10px;
        }
        .game-wrapper {
          width: 95vmin;
          height: 95vmin;
          padding: 15px;
        }
      }
      
      /* Très petits écrans */
      @media (max-width: 480px) {
        .game-wrapper {
          width: 98vmin;
          height: 98vmin;
          padding: 10px;
        }
      }
    </style>
  `;

  // Initialiser le jeu après que le DOM soit chargé
  setTimeout(() => {
    console.log('Initializing Pong game...');
    const canvas = document.getElementById('pongGameCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found!');
      return;
    }
    console.log('Canvas found, creating game instance...');
    const game = new MultiPong(canvas);
    game.init();
  }, 0);

  return html;
}