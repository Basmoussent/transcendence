import { Pong } from '../../game/pong/pong';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';
import { live } from '../../routes/web_socket/ws_chat';
import { getAuthToken } from '@/utils/auth';

export function renderTournaments() {
  const html =  `

<div class="tournaments-container">
  <canvas id="gameCanvas" width="900" height="600"></canvas>

  <div class="tournaments-header" style="display: flex; align-items: center; width: 100%; padding-left: 0; padding-right: 0;">
    <div style="flex:0 0 auto; display: flex; align-items: center;">
      
    </div>
    <div style="flex:1 1 0; display: flex; align-items: center; justify-content: center;">
      <h1 class="tournaments-title">
        <i class="fas fa-trophy"></i>
        Tournament Lobby
      </h1>
    </div>
    <div class="tournaments-actions" style="flex:0 0 auto; display: flex; gap: 14px; align-items: center;">
    <button class="btn btn-primary" id="homeBtn" onclick="returnHome()">
        <i class="fas fa-home"></i>
        ${t('social.home' as any)}
      </button>  
    <button class="btn btn-primary" onclick="addPlayer()">
        <i class="fas fa-user-plus"></i>
        Add Player
      </button>
      <button class="btn btn-secondary" onclick="resetTournament()">
        <i class="fas fa-redo"></i>
        Reset
      </button>
    </div>
  </div>

  <div class="tournament-info-bar">
    <div class="info-item">
      <i class="fas fa-users"></i>
      <span id="playerCount">0/8 Players</span>
    </div>
    <div class="info-item">
      <i class="fas fa-layer-group"></i>
      <span>Single Elimination</span>
    </div>
    <div class="info-item">
      <i class="fas fa-clock"></i>
      <span id="tournamentStatus">Waiting for players</span>
    </div>
  </div>

  <!-- Lobby des joueurs -->
  <div class="lobby-container" id="lobby-container">
    <h2 class="lobby-title">
      <i class="fas fa-users"></i>
      Players Lobby
    </h2>
    <div class="players-list" id="players-list">
      <!-- Les joueurs seront ajoutés ici dynamiquement -->
    </div>
    <div class="lobby-actions">
      <button class="btn btn-success" id="startTournamentBtn" onclick="startTournament()" disabled>
        <i class="fas fa-play"></i>
        Start Tournament (Need at least 2 players)
      </button>
    </div>
  </div>

  <div class="bracket-container" id="bracket-container" style="display: none;">
    <!-- Quarter Finals - PREMIER TOUR À GAUCHE -->
    <div class="bracket-round" id="qf-round" style="display: none;">
      <h3 class="round-title">Quarter Finals</h3>
      <div class="matches" id="qf-matches">
        <!-- Les matches seront générés dynamiquement -->
      </div>
    </div>

    <!-- Semi Finals -->
    <div class="bracket-round" id="sf-round" style="display: none;">
      <h3 class="round-title">Semi Finals</h3>
      <div class="matches">
        <div class="match" data-match="sf1">
          <div class="match-players">
            <div class="player player-1" data-winner-from="qf1">
              <span class="player-name">Winner QF1</span>
              <span class="player-score">0</span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2" data-winner-from="qf2">
              <span class="player-name">Winner QF2</span>
              <span class="player-score">0</span>
            </div>
          </div>
          <button class="play-match-btn" onclick="playMatch('sf1')" disabled>
            <i class="fas fa-play"></i>
            Play Match
          </button>
        </div>

        <div class="match" data-match="sf2">
          <div class="match-players">
            <div class="player player-1" data-winner-from="qf3">
              <span class="player-name">Winner QF3</span>
              <span class="player-score">0</span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2" data-winner-from="qf4">
              <span class="player-name">Winner QF4</span>
              <span class="player-score">0</span>
            </div>
          </div>
          <button class="play-match-btn" onclick="playMatch('sf2')" disabled>
            <i class="fas fa-play"></i>
            Play Match
          </button>
        </div>
      </div>
    </div>

    <!-- Final -->
    <div class="bracket-round" id="final-round" style="display: none;">
      <h3 class="round-title">Final</h3>
      <div class="matches">
        <div class="match final-match" data-match="final">
          <div class="match-players">
            <div class="player player-1" data-winner-from="sf1">
              <span class="player-name">Winner SF1</span>
              <span class="player-score">0</span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2" data-winner-from="sf2">
              <span class="player-name">Winner SF2</span>
              <span class="player-score">0</span>
            </div>
          </div>
          <button class="play-match-btn" onclick="playMatch('final')" disabled>
            <i class="fas fa-play"></i>
            Play Match
          </button>
        </div>
      </div>
    </div>

    <!-- Champion - À DROITE -->
    <div class="bracket-round" id="champion-round" style="display: none;">
      <h3 class="round-title">🏆 Champion</h3>
      <div class="champion-podium">
        <div class="champion-slot">
          <i class="fas fa-crown"></i>
          <span id="championName">TBD</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Message d'état vide -->
  <div id="empty-state" class="empty-state">
    <div class="empty-state-content">
      <i class="fas fa-trophy empty-icon"></i>
      <h2>Tournament Lobby</h2>
      <p>Add players to start building your tournament bracket!</p>
      <button class="btn btn-primary" onclick="addPlayer()">
        <i class="fas fa-user-plus"></i>
        Add First Player
      </button>
    </div>
  </div>
</div>

<!-- Add Player Modal -->
<div id="addPlayerModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Add New Player</h3>
      <button class="close-btn" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <input type="text" id="playerNameInput" placeholder="Enter player username..." maxlength="20">
      <input type="text" id="displayNameInput" placeholder="Choose a display name..." maxlength="20" style="display:none;margin-top:10px;">
      <div id="errorMessage" class="error-message" style="display: none;">
        ❌ Utilisateur non trouvé
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" onclick="confirmAddPlayer()">
          <i class="fas fa-plus"></i>
          Add Player
        </button>
        <button class="btn btn-secondary" onclick="closeModal()">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #232526 0%, #414345 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', 'Arial', sans-serif;
    letter-spacing: 0.01em;
  }

  .tournaments-container {
    position: relative;
    z-index: 1;
    padding: 32px 16px 16px 16px;
    max-width: 1200px;
    margin: 48px auto 0 auto;
    color: #f5f6fa;
    min-height: 80vh;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    border-radius: 24px;
    background: rgba(30, 32, 38, 0.92);
    overflow: visible;
  }

  .tournaments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 18px 32px;
    background: rgba(40, 44, 52, 0.85);
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  .home-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
    transition: all 0.2s;
  }
  .home-button:hover {
    background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
  }

  #gameCanvas {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s cubic-bezier(.4,2,.3,1);
    background: #181a20;
    border-radius: 18px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
    border: 2px solid #667eea;
    outline: 3px solid #ffd70044;
    max-width: 98vw;
    max-height: 90vh;
  }
  #gameCanvas.active {
    opacity: 1;
    pointer-events: auto;
  }


  .tournaments-title {
    font-size: 2.7rem;
    font-weight: bold;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 18px;
    letter-spacing: 0.02em;
    color: #ffd700;
    text-shadow: 0 2px 8px rgba(255, 215, 0, 0.12);
  }

  .tournaments-title i {
    color: #ffd700;
  }

  .tournaments-actions {
    margin-right: 4%;
    display: flex;
    gap: 14px;
  }

  .btn {
    padding: 12px 28px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1.08rem;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.10);
  }
  .btn-primary {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  .btn-primary:hover {
    background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
  }
  .btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #e0e0e0;
    border: 1px solid rgba(255, 255, 255, 0.13);
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    transform: translateY(-2px) scale(1.04);
  }
  .btn-success {
    background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
    color: white;
  }
  .btn-success:hover:not(:disabled) {
    background: linear-gradient(90deg, #45a049 0%, #4CAF50 100%);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.18);
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .tournament-info-bar {
    display: flex;
    gap: 36px;
    margin-bottom: 32px;
    padding: 16px 28px;
    background: rgba(40, 44, 52, 0.7);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #bfc7d5;
    font-size: 1.08rem;
  }
  .info-item i {
    color: #667eea;
  }

  /* Lobby Styles */
  .lobby-container {
    background: transparent;
    border-radius: 18px;
    padding: 36px 24px 24px 24px;
    margin-bottom: 36px;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.10);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-height: 420px;
  }

  .lobby-title {
    text-align: center;
    color: #ffd700;
    font-size: 2.1rem;
    font-weight: bold;
    margin: 0 0 28px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    text-shadow: 0 2px 8px rgba(255, 215, 0, 0.10);
  }

  .lobby-title i {
    color: #ffd700;
  }

  .players-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
    margin-bottom: 32px;
    width: 100%;
  }
  .player-card {
    background: rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    padding: 18px 14px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    display: flex;
    align-items: center;
    gap: 18px;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
  }
  .player-card:hover {
    background: rgba(255, 255, 255, 0.13);
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.13);
  }
  .player-avatar {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.7rem;
    font-weight: bold;
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.13);
  }
  .player-info {
    flex: 1;
  }
  .player-name {
    font-weight: bold;
    font-size: 1.15rem;
    margin-bottom: 4px;
    color: #ffd700;
  }
  .player-number {
    color: #bfc7d5;
    font-size: 0.97rem;
  }
  .remove-player {
    background: rgba(255, 0, 0, 0.13);
    border: 1px solid rgba(255, 0, 0, 0.18);
    color: #ff6b6b;
    padding: 7px 12px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s;
  }
  .remove-player:hover {
    background: rgba(255, 0, 0, 0.22);
    color: #ff4444;
    transform: scale(1.07);
  }
  .lobby-actions {
    text-align: center;
    margin-top: 10px;
  }

  .bracket-container {
    display: flex;
    flex-direction: row;
    gap: 44px;
    padding: 24px 12px;
    background: rgba(40, 44, 52, 0.7);
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.10);
    overflow-x: auto;
    align-items: flex-start;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .bracket-round {
    min-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex-shrink: 0;
  }
  .round-title {
    text-align: center;
    color: #667eea;
    font-size: 1.45rem;
    font-weight: bold;
    margin: 0;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.18);
    letter-spacing: 0.01em;
  }
  .matches {
    display: flex;
    flex-direction: column;
    gap: 24px;
    justify-items: center;
  }
  .match {
    background: rgba(0, 0, 0, 0.38);
    border-radius: 12px;
    padding: 18px 12px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    transition: all 0.2s;
    width: 100%;
    max-width: none;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.10);
  }
  .match:hover {
    border-color: rgba(102, 126, 234, 0.22);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.13);
  }
  .final-match {
    border: 2px solid #ffd700;
    background: rgba(255, 215, 0, 0.10);
  }
  .match-players {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 18px;
  }
  .player {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 7px;
    border-left: 3px solid #667eea;
    transition: background 0.2s;
  }
  .player.winner {
    background: rgba(76, 175, 80, 0.18);
    border-left-color: #4CAF50;
  }
  .player.loser {
    background: rgba(255, 0, 0, 0.13);
    border-left-color: #ff6b6b;
  }
  .player.empty {
    opacity: 0.5;
    font-style: italic;
  }
  .player-name {
    font-weight: bold;
    color: #ffd700;
  }
  .player-score {
    font-size: 1.25rem;
    font-weight: bold;
    color: #ffd700;
  }
  .vs {
    text-align: center;
    font-weight: bold;
    color: #667eea;
    font-size: 1.05rem;
  }
  .play-match-btn {
    width: 100%;
    padding: 10px;
    background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1.08rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.10);
  }
  .play-match-btn:hover:not(:disabled) {
    background: linear-gradient(90deg, #45a049 0%, #4CAF50 100%);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.18);
  }
  .champion-podium {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 160px;
  }
  .champion-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 36px 18px;
    background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);
    color: #333;
    border-radius: 22px;
    font-weight: bold;
    font-size: 1.25rem;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.18);
    text-align: center;
    min-width: 180px;
    max-width: 250px;
  }
  .champion-slot i {
    font-size: 3.2rem;
  }
  /* Modal Styles */
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(6px);
  }
  .modal-content {
    background: rgba(30, 32, 38, 0.98);
    margin: 12% auto;
    padding: 0;
    border-radius: 18px;
    width: 92%;
    max-width: 420px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    box-shadow: 0 4px 24px rgba(102, 126, 234, 0.13);
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 22px 22px 12px 22px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  }
  .modal-header h3 {
    margin: 0;
    color: #ffd700;
    font-size: 1.3rem;
  }
  .close-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 28px;
    cursor: pointer;
    transition: color 0.2s;
  }
  .close-btn:hover {
    color: #667eea;
  }
  .modal-body {
    padding: 22px;
  }
  .modal-body input {
    width: 100%;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.10);
    color: white;
    font-size: 1.08rem;
    margin-bottom: 22px;
    box-sizing: border-box;
    transition: border 0.2s;
  }
  .modal-body input:focus {
    border: 1.5px solid #667eea;
    outline: none;
  }
  .modal-body input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  .error-message {
    color: #ff6b6b;
    font-size: 1.01rem;
    margin-top: 10px;
    text-align: center;
  }
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    text-align: center;
  }
  .empty-state-content {
    background: rgba(40, 44, 52, 0.7);
    padding: 44px 24px;
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.10);
    border: 1px solid rgba(255, 255, 255, 0.08);
    max-width: 420px;
    margin: 0 auto;
  }
  .empty-icon {
    font-size: 4.2rem;
    color: #ffd700;
    margin-bottom: 22px;
    text-shadow: 0 2px 8px rgba(255, 215, 0, 0.10);
  }
  .empty-state-content h2 {
    color: #ffd700;
    margin: 0 0 18px 0;
    font-size: 2.1rem;
    text-shadow: 0 2px 8px rgba(255, 215, 0, 0.10);
  }
  .empty-state-content p {
    color: #bfc7d5;
    margin: 0 0 28px 0;
    font-size: 1.13rem;
  }
  @media (max-width: 900px) {
    .tournaments-header {
      flex-direction: column;
      gap: 18px;
      padding: 12px 8px;
    }
    .home-button {
      width: 100%;
      justify-content: center;
    }
    .tournaments-container {
      margin-top: 16px;
      padding: 12px 2vw;
    }
    .tournament-info-bar {
      flex-direction: column;
      gap: 12px;
      padding: 10px 8px;
    }
    .matches {
      grid-template-columns: 1fr;
    }
    .players-list {
      grid-template-columns: 1fr;
    }
    #gameCanvas {
      max-width: 98vw;
      max-height: 60vw;
    }
  }
  @media (max-width: 600px) {
    .tournaments-title {
      font-size: 1.3rem;
    }
    .lobby-title {
      font-size: 1.1rem;
    }
    .bracket-round {
      min-width: 180px;
    }
    #gameCanvas {
      max-width: 99vw;
      max-height: 50vw;
    }
  }
</style>
`;

  setTimeout(() => {
    const homeBtn = document.getElementById('homeBtn');
	
		if (homeBtn) {
			homeBtn.addEventListener('click', () => {
				window.history.pushState({}, '', '/main');
				window.dispatchEvent(new PopStateEvent('popstate'));
			});
		}
    
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found!');
      return;
    }
    console.log('Canvas found, creating game instance...');
  }, 0);
  return html;

}

// Tournament state
type TournamentPlayer = { username: string, displayName: string };
let tournamentData = {
  players: [] as TournamentPlayer[],
  matches: {},
  currentRound: 'qf',
  inLobby: true
};

// Add player function
(window as any).addPlayer = function() {
  if (tournamentData.players.length < 8) {
    const modal = document.getElementById('addPlayerModal');
    const input = document.getElementById('playerNameInput') as HTMLInputElement;
    const displayInput = document.getElementById('displayNameInput') as HTMLInputElement;
    if (modal) modal.style.display = 'block';
    if (input) input.focus();
    if (displayInput) displayInput.value = '';
    if (displayInput) displayInput.style.display = 'none';
    if (input) input.style.display = '';
    const addBtn = document.querySelector('#addPlayerModal .btn-primary') as HTMLButtonElement;
    if (addBtn) addBtn.textContent = 'Add Player';
  }
};

(window as any).returnHome = function() {
  window.history.pushState({}, '', '/main');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

(window as any).closeModal = function() {
  const modal = document.getElementById('addPlayerModal');
  const input = document.getElementById('playerNameInput') as HTMLInputElement;
  const errorMessage = document.getElementById('errorMessage');
  if (modal) modal.style.display = 'none';
  if (input) input.value = '';
  if (errorMessage) errorMessage.style.display = 'none';
};

(window as any).confirmAddPlayer = async function() {
  const input = document.getElementById('playerNameInput') as HTMLInputElement;
  const displayInput = document.getElementById('displayNameInput') as HTMLInputElement;
  const addBtn = document.querySelector('#addPlayerModal .btn-primary') as HTMLButtonElement;
  const playerName = input?.value.trim();
  if (playerName && !isAPlayer(playerName) && tournamentData.players.length < 8 && (!displayInput || displayInput.style.display === 'none')) { // && !isAPlayer
    // Première étape : valider le username
    const response = await fetch(`/api/user/username/?username=${playerName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.data == null) {
        console.log(`le user ${playerName} n'existe pas`)
        return (0);
      }

      if (data.data.username) {
        if (displayInput) {
          displayInput.style.display = '';
          displayInput.focus();
        }
        if (input) input.style.display = 'none';
        if (addBtn) addBtn.textContent = 'Confirm';
        return;
      } else {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) errorMessage.style.display = 'block';
      }
    }
    return 0;
  } else if (displayInput && displayInput.style.display !== 'none') {
    const displayName = sanitizeHtml(displayInput.value.trim());
    if (displayName) {
      // On retrouve le username caché dans le champ input (il a été validé juste avant)
      const username = sanitizeHtml(input.value.trim());
      tournamentData.players.push({ username, displayName });
      updateLobbyDisplay();
      (window as any).closeModal();
      return 1;
    }
    // Si displayName vide, on ne fait rien
    return 0;
  }
  return 0;
};

(window as any).removePlayer = function(index: any) {
  if (index >= 0 && index < tournamentData.players.length) {
    tournamentData.players.splice(index, 1);
    updateLobbyDisplay();
  }
};

(window as any).startTournament = function() {
  if (tournamentData.players.length >= 2) {
    tournamentData.inLobby = false;
    console.log("tournamentData.players:", tournamentData.players);
    generateQuarterFinals();
    updateTournamentDisplay();
  }
};

function isAPlayer(username: string): boolean {
  return tournamentData.players.some(p => p.username === username);
}

function updateLobbyDisplay() {
  const playerCountElement = document.getElementById('playerCount');
  if (playerCountElement) {
    playerCountElement.textContent = tournamentData.players.length + '/8 Players';
  }
  
  const statusElement = document.getElementById('tournamentStatus');
  if (statusElement) {
    if (tournamentData.players.length === 8) {
      statusElement.textContent = 'Ready to start!';
    } else {
      statusElement.textContent = 'Waiting for players';
    }
  }
  
  const emptyState = document.getElementById('empty-state');
  const lobbyContainer = document.getElementById('lobby-container');
  const bracketContainer = document.getElementById('bracket-container');
  
  if (tournamentData.players.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (lobbyContainer) lobbyContainer.style.display = 'none';
    if (bracketContainer) bracketContainer.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (lobbyContainer) lobbyContainer.style.display = 'block';
    if (bracketContainer) bracketContainer.style.display = 'none';
    
    // Update players list
    const playersList = document.getElementById('players-list');
    if (playersList) {
      playersList.innerHTML = '';
      
      tournamentData.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
          <div class="player-avatar">
            ${player.displayName.charAt(0).toUpperCase()}
          </div>
          <div class="player-info">
            <div class="player-name">${player.displayName}</div>
            <div class="player-number">Player ${index + 1}</div>
          </div>
          <button class="remove-player" onclick="removePlayer(${index})">
            <i class="fas fa-times"></i>
          </button>
        `;
        playersList.appendChild(playerCard);
      });
    }
    
    // Update start tournament button
    const startBtn = document.getElementById('startTournamentBtn') as HTMLButtonElement;
    if (startBtn) {
      if (tournamentData.players.length >= 2) {
        startBtn.disabled = false;
        if (tournamentData.players.length === 8) {
          startBtn.innerHTML = '<i class="fas fa-play"></i> Start Tournament';
        } else {
          startBtn.innerHTML = `<i class="fas fa-play"></i> Start Tournament (${tournamentData.players.length} players)`;
        }
      } else {
        startBtn.disabled = true;
        startBtn.innerHTML = `<i class="fas fa-play"></i> Start Tournament (Need at least 2 players)`;
      }
    }
  }
}

function generateQuarterFinals() {
  const qfMatchesContainer = document.getElementById('qf-matches');
  if (!qfMatchesContainer) return;
  
  qfMatchesContainer.innerHTML = '';
  
  const playerCount = tournamentData.players.length;
  let matchCount = 0;
  let matchPrefix = 'qf';
  let players = [...tournamentData.players];

  if (playerCount <= 2) {
    matchCount = 1; // Final only
    matchPrefix = 'final';
  } else if (playerCount <= 4) {
    matchCount = 2; // 2 semi-finals for 4 players
    matchPrefix = 'sf';
  } else {
    matchCount = Math.ceil(playerCount / 2); // Quarter-finals
    matchPrefix = 'qf';
  }

  for (let i = 1; i <= matchCount; i++) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'match';
    matchDiv.setAttribute('data-match', matchPrefix + i);

    const player1Num = (i - 1) * 2 + 1;
    const player2Num = (i - 1) * 2 + 2;
    const player1 = players[player1Num - 1];
    const player2 = players[player2Num - 1];

    let matchHTML =
      '<div class="match-players">' +
        '<div class="player player-1' + (!player1 ? ' empty' : '') + '" data-player="' + player1Num + '">' +
          '<span class="player-name">' + (player1 ? player1.displayName : 'Player ' + player1Num) + '</span>' +
          '<span class="player-score">0</span>' +
        '</div>' +
        '<div class="vs">VS</div>';

    if (player2) {
      matchHTML +=
        '<div class="player player-2" data-player="' + player2Num + '">' +
          '<span class="player-name">' + player2.displayName + '</span>' +
          '<span class="player-score">0</span>' +
        '</div>';
    } else {
      matchHTML +=
        '<div class="player player-2 empty" data-player="' + player2Num + '">' +
          '<span class="player-name">(Qualified)</span>' +
          '<span class="player-score">-</span>' +
        '</div>';
    }
    matchHTML += '</div>';

    // Si le match a deux joueurs, bouton Play Match, sinon qualification auto
    if (player1 && player2) {
      matchHTML +=
        '<button class="play-match-btn" onclick="playMatch(\'' + matchPrefix + i + '\')" disabled>' +
          '<i class="fas fa-play"></i>' +
          'Play Match' +
        '</button>';
    } else if (player1 && !player2) {
      // Qualification automatique pour player1
      setTimeout(() => {
        advanceWinner(matchPrefix + i, player1.displayName);
        // Marquer visuellement la qualification
        const match = document.querySelector('[data-match="' + matchPrefix + i + '"]');
        if (match) {
          const p1 = match.querySelector('.player-1');
          if (p1) {
            p1.classList.add('winner');
            const scoreElement = p1.querySelector('.player-score');
            if (scoreElement) scoreElement.textContent = 'Qualified';
          }
        }
      }, 100); // Laisser le DOM se mettre à jour
    }

    matchDiv.innerHTML = matchHTML;
    qfMatchesContainer.appendChild(matchDiv);
  }
  
  // Update the round title
  const roundTitleElement = document.querySelector('#qf-round .round-title');
  if (roundTitleElement) {
    const playerCount = tournamentData.players.length;
    if (playerCount <= 2) {
      roundTitleElement.textContent = 'Final';
    } else if (playerCount <= 4) {
      roundTitleElement.textContent = 'Semi Finals';
    } else {
      roundTitleElement.textContent = 'Quarter Finals';
    }
  }
}

function updateTournamentDisplay() {
  if (tournamentData.inLobby) {
    updateLobbyDisplay();
    return;
  }
  
  const playerCountElement = document.getElementById('playerCount');
  if (playerCountElement) {
    playerCountElement.textContent = tournamentData.players.length + '/8 Players';
  }
  
  const statusElement = document.getElementById('tournamentStatus');
  if (statusElement) {
    statusElement.textContent = 'Tournament in progress';
  }
  
  const emptyState = document.getElementById('empty-state');
  const lobbyContainer = document.getElementById('lobby-container');
  const bracketContainer = document.getElementById('bracket-container');
  
  if (emptyState) emptyState.style.display = 'none';
  if (lobbyContainer) lobbyContainer.style.display = 'none';
  if (bracketContainer) bracketContainer.style.display = 'flex';
  
  // Only show the first level (quarter finals) initially
  const qfRound = document.getElementById('qf-round');
  if (qfRound) qfRound.style.display = 'flex';
  
  for (let i = 0; i < 8; i++) {
    const playerElement = document.querySelector('[data-player="' + (i + 1) + '"] .player-name');
    if (playerElement) {
      if (tournamentData.players[i]) {
        playerElement.textContent = tournamentData.players[i].displayName;
        playerElement.parentElement?.classList.remove('empty');
      } else {
        playerElement.textContent = 'Player ' + (i + 1);
        playerElement.parentElement?.classList.add('empty');
      }
    }
  }

  const sfRound = document.getElementById('sf-round');
  const finalRound = document.getElementById('final-round');
  const championRound = document.getElementById('champion-round');
  
  if (sfRound) sfRound.style.display = 'none';
  if (finalRound) finalRound.style.display = 'none';
  if (championRound) championRound.style.display = 'none';

  updatePlayButtons();
}

function updatePlayButtons() {
  const playerCount = tournamentData.players.length;
  let matchPrefix = 'qf';
  
  if (playerCount <= 2) {
    matchPrefix = 'final';
  } else if (playerCount <= 4) {
    matchPrefix = 'sf';
  } else {
    matchPrefix = 'qf';
  }
  
  const buttons = document.querySelectorAll('[data-match^="' + matchPrefix + '"] .play-match-btn');
  buttons.forEach(btn => {
    if (btn instanceof HTMLButtonElement) {
      // Enable buttons if we have enough players for that match
      const matchId = btn.closest('[data-match]')?.getAttribute('data-match');
      if (matchId) {
        const matchNumber = parseInt(matchId.replace(matchPrefix, ''));
        const requiredPlayers = matchNumber * 2;
        btn.disabled = tournamentData.players.length < requiredPlayers;
      }
    }
  });
}

function advanceWinner(matchId: any, winnerName: string) {
  console.log('Advancing winner:', winnerName, 'from match:', matchId);
  
  // Special case: if we only have 2 players, the first match is the final
  if (tournamentData.players.length <= 2 && matchId === 'final1') {
    const championElement = document.getElementById('championName');
    const championRound = document.getElementById('champion-round');
    if (championElement) championElement.textContent = winnerName;
    if (championRound) championRound.style.display = 'flex';
    return;
  }
  
  // Special case: if we have 3-4 players, the first matches are semi-finals
  if (tournamentData.players.length <= 4 && (matchId === 'sf1' || matchId === 'sf2')) {
    // Check if both semi-finals are completed
    const sf1Winner = document.querySelector('[data-match="sf1"] .winner .player-name')?.textContent;
    const sf2Winner = document.querySelector('[data-match="sf2"] .winner .player-name')?.textContent;
    
    if (sf1Winner && sf2Winner) {
      // Both semi-finals are done, show final
      const finalRound = document.getElementById('final-round');
      if (finalRound) finalRound.style.display = 'flex';
      
      // Set the winners in the final
      const finalPlayer1 = document.querySelector('[data-match="final"] .player-1 .player-name') as HTMLElement;
      const finalPlayer2 = document.querySelector('[data-match="final"] .player-2 .player-name') as HTMLElement;
      
      if (finalPlayer1) finalPlayer1.textContent = sf1Winner;
      if (finalPlayer2) finalPlayer2.textContent = sf2Winner;
      
      // Enable the final match
      const finalButton = document.querySelector('[data-match="final"] .play-match-btn') as HTMLButtonElement;
      if (finalButton) finalButton.disabled = false;
    }
    return;
  }
  
  // Special case: if we have 5-8 players, handle quarter-finals advancement
  if (tournamentData.players.length >= 5 && (matchId === 'qf1' || matchId === 'qf2' || matchId === 'qf3' || matchId === 'qf4')) {
    // Check if both pairs of quarter-finals are completed
    const qf1Winner = document.querySelector('[data-match="qf1"] .winner .player-name')?.textContent;
    const qf2Winner = document.querySelector('[data-match="qf2"] .winner .player-name')?.textContent;
    const qf3Winner = document.querySelector('[data-match="qf3"] .winner .player-name')?.textContent;
    const qf4Winner = document.querySelector('[data-match="qf4"] .winner .player-name')?.textContent;
    
    // Show semi-finals when first pair is complete
    if (qf1Winner && qf2Winner) {
      const sfRound = document.getElementById('sf-round');
      if (sfRound) sfRound.style.display = 'flex';
      
      // Set the winners in the first semi-final
      const sf1Player1 = document.querySelector('[data-match="sf1"] .player-1 .player-name') as HTMLElement;
      const sf1Player2 = document.querySelector('[data-match="sf1"] .player-2 .player-name') as HTMLElement;
      
      if (sf1Player1) sf1Player1.textContent = qf1Winner;
      if (sf1Player2) sf1Player2.textContent = qf2Winner;
      
      // Enable the first semi-final if both players are set
      if (sf1Player1 && sf1Player2) {
        const sf1Button = document.querySelector('[data-match="sf1"] .play-match-btn') as HTMLButtonElement;
        if (sf1Button) sf1Button.disabled = false;
      }
    }
    
    // Enable second semi-final when second pair is complete
    if (qf3Winner && qf4Winner) {
      const sf2Player1 = document.querySelector('[data-match="sf2"] .player-1 .player-name') as HTMLElement;
      const sf2Player2 = document.querySelector('[data-match="sf2"] .player-2 .player-name') as HTMLElement;
      
      if (sf2Player1) sf2Player1.textContent = qf3Winner;
      if (sf2Player2) sf2Player2.textContent = qf4Winner;
      
      // Enable the second semi-final if both players are set
      if (sf2Player1 && sf2Player2) {
        const sf2Button = document.querySelector('[data-match="sf2"] .play-match-btn') as HTMLButtonElement;
        if (sf2Button) sf2Button.disabled = false;
      }
    }
    return;
  }
  

  
  const advancement: { [key: string]: string } = {
    'qf1': 'sf1-p1',
    'qf2': 'sf1-p2', 
    'qf3': 'sf2-p1',
    'qf4': 'sf2-p2',
    'sf1': 'final-p1',
    'sf2': 'final-p2'
  };
  
  const target = advancement[matchId];
  if (target) {
    const parts: string[] = target.split('-');
    const nextMatch = parts[0];
    const playerSlot = parts[1];
    const nextMatchElement = document.querySelector('[data-match="' + nextMatch + '"]') as HTMLElement | null;
    
    if (nextMatchElement) {
      const playerElement = nextMatchElement.querySelector('.player-' + playerSlot.slice(-1) + ' .player-name') as HTMLElement | null;
      if (playerElement) {
        playerElement.textContent = winnerName;
        playerElement.parentElement?.classList.remove('empty');
        
        // Show the next level if it's not already visible
        if (nextMatch.startsWith('sf')) {
          const sfRound = document.getElementById('sf-round');
          if (sfRound) sfRound.style.display = 'flex';
        } else if (nextMatch === 'final') {
          const finalRound = document.getElementById('final-round');
          if (finalRound) finalRound.style.display = 'flex';
        }
        
        // @ts-ignore
        checkAndEnableNextMatch(nextMatch);
      }
    }
  }
  
  // Handle final match winner (champion)
  if (matchId === 'final') {
    const championElement = document.getElementById('championName');
    const championRound = document.getElementById('champion-round');
    if (championElement) championElement.textContent = winnerName;
    if (championRound) championRound.style.display = 'flex';
  }
}

function checkAndEnableNextMatch(matchId: any) {
  const match = document.querySelector('[data-match="' + matchId + '"]');
  if (!match) return;
  
  const players = match.querySelectorAll('.player .player-name');
  
  let bothPlayersReady = true;
  players.forEach(player => {
    if (player.textContent?.startsWith('Winner') || player.textContent?.startsWith('Player')) {
      bothPlayersReady = false;
    }
  });
  
  if (bothPlayersReady) {
    const button = match.querySelector('.play-match-btn') as HTMLButtonElement;
    if (button) button.disabled = false;
  }
}

(window as any).resetTournament = function() {
  tournamentData = {
    players: [],
    matches: {},
    currentRound: 'qf',
    inLobby: true
  };
  
  document.querySelectorAll('.player').forEach(player => {
    player.classList.remove('winner');
    player.classList.add('empty');
    const scoreElement = player.querySelector('.player-score');
    if (scoreElement) scoreElement.textContent = '0';
  });
  
  for (let i = 1; i <= 8; i++) {
    const playerElement = document.querySelector('[data-player="' + i + '"] .player-name');
    if (playerElement) {
      playerElement.textContent = 'Player ' + i;
      playerElement.parentElement?.classList.add('empty');
    }
  }
  
  document.querySelectorAll('[data-winner-from]').forEach(element => {
    const winnerFrom = element.getAttribute('data-winner-from');
    const nameElement = element.querySelector('.player-name');
    if (nameElement && winnerFrom) {
      nameElement.textContent = 'Winner ' + winnerFrom.toUpperCase();
      element.classList.add('empty');
    }
  });
  
  document.querySelectorAll('.play-match-btn').forEach(btn => {
    if (btn instanceof HTMLButtonElement) {
      btn.disabled = true;
    }
  });
  
  const championElement = document.getElementById('championName');
  if (championElement) championElement.textContent = 'TBD';
  
  const bracketContainer = document.getElementById('bracket-container');
  const emptyState = document.getElementById('empty-state');
  if (bracketContainer) bracketContainer.style.display = 'none';
  if (emptyState) emptyState.style.display = 'flex';
  
  updateLobbyDisplay();
};

(window as any).onclick = function(event: Event) {
  const modal = document.getElementById('addPlayerModal');
  if (event.target === modal) {
    (window as any).closeModal();
  }
};

document.addEventListener('keydown', function(event: KeyboardEvent) {
  const modal = document.getElementById('addPlayerModal');
  if (event.key === 'Enter' && modal?.style.display === 'block') {
    (window as any).confirmAddPlayer();
  }
}, { once: true });

document.addEventListener('input', function(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target && target.id === 'playerNameInput') {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) errorMessage.style.display = 'none';
  }
});

  (window as any).startGame = function(matchId: any) {
  console.log('Initializing Pong game...', matchId);
  
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }
  const match = document.querySelector('[data-match="' + matchId + '"]');
  const players = match!.querySelectorAll('.player');
  
  // Récupérer les usernames réels au lieu des displayNames
  const p1DisplayName = players[0].querySelector('.player-name')?.textContent;
  const p2DisplayName = players[1].querySelector('.player-name')?.textContent;
  
  // Trouver les usernames correspondants dans tournamentData.players
  const p1Data = tournamentData.players.find(p => p.displayName === p1DisplayName);
  const p2Data = tournamentData.players.find(p => p.displayName === p2DisplayName);
  
  const p1Username = p1Data?.username || p1DisplayName || 'Player1';
  const p2Username = p2Data?.username || p2DisplayName || 'Player2';

  (window as any).ws.send(JSON.stringify({
    type: 'notify_tournament',
    user1: p1Username,
    user2: p2Username,
  }));
  
  const game = new Pong(canvas);
  if (canvas) {
    canvas.classList.add('active');
  }
  // Passer les usernames au jeu au lieu des displayNames
  game.init(p1Username, p2Username);
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  console.log("game.paddles[0].name :", p1Username, "game.paddles[1].name :", p2Username);
  
  const checkGameEnd = () => {
    if ((game as any).end) {
      const p1 = (game as any).paddles[0];
      const p2 = (game as any).paddles[1];
      const winnerUsername = p1.score > p2.score ? p1.name : p2.name;
      console.log("p1 :", p1.name, "p2 :", p2.name, "winner :", winnerUsername);
      const match = document.querySelector('[data-match="' + matchId + '"]');
      if (match) {
        console.log("match found");
        const players = match.querySelectorAll('.player');
        const winnerIndex = p1.score > p2.score ? 0 : 1;
        const loserIndex = p1.score < p2.score ? 0 : 1;
        const winnerElement = players[winnerIndex] as HTMLElement;
        const loserElement = players[loserIndex] as HTMLElement;
        
        if (winnerElement) {
          console.log("winnerElement found");
          winnerElement.classList.add('winner');
          const scoreElement = winnerElement.querySelector('.player-score');
          if (scoreElement) {
            console.log("scoreElement found", scoreElement.textContent, Math.max(p1.score, p2.score));
            scoreElement.textContent = Math.max(p1.score, p2.score).toString();
          }
          
          // Trouver le displayName correspondant au username gagnant
          const winnerData = tournamentData.players.find(p => p.username === winnerUsername);
          const winnerDisplayName = winnerData?.displayName || winnerUsername;
          
          const winnerNameElement = winnerElement.querySelector('.player-name');
          if (winnerNameElement && winnerDisplayName) {
            advanceWinner(matchId, winnerDisplayName);
          }
        }

        if (loserElement) {
          console.log("loserElement found");
          loserElement.classList.add('loser');
          const scoreElement = loserElement.querySelector('.player-score');
          if (scoreElement) {
            console.log("scoreElement found", scoreElement.textContent, Math.max(p1.score, p2.score));
            scoreElement.textContent = Math.min(p1.score, p2.score).toString();
          }
          
        }
        
        const button = match.querySelector('.play-match-btn') as HTMLButtonElement;
        if (button) button.disabled = true;
      }
      else {
        console.log("match not found", matchId);
      }
      
      (window as any).endGame();
      return; 
    }
    
    // Continuer à surveiller si le jeu n'est pas terminé
    requestAnimationFrame(checkGameEnd);
  };
  
  // Commencer la surveillance
  checkGameEnd();
};

(window as any).playMatch = function(matchId: any) {
  console.log('Playing match:', matchId);
  (window as any).startGame(matchId);
};

(window as any).endGame = function() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (canvas) {
    canvas.classList.remove('active');
  }
};

function cleanStart() {
  tournamentData = {
    players: [],
    matches: {},
    currentRound: 'qf',
    inLobby: true
  };
  
  document.querySelectorAll('.player').forEach(player => {
    player.classList.remove('winner');
    player.classList.add('empty');
    const scoreElement = player.querySelector('.player-score');
    if (scoreElement) scoreElement.textContent = '0';
  });
  
  for (let i = 1; i <= 8; i++) {
    const playerElement = document.querySelector('[data-player="' + i + '"] .player-name');
    if (playerElement) {
      playerElement.textContent = 'Player ' + i;
      playerElement.parentElement?.classList.add('empty');
    }
  }
  
  document.querySelectorAll('[data-winner-from]').forEach(element => {
    const winnerFrom = element.getAttribute('data-winner-from');
    const nameElement = element.querySelector('.player-name');
    if (nameElement && winnerFrom) {
      nameElement.textContent = 'Winner ' + winnerFrom.toUpperCase();
      element.classList.add('empty');
    }
  });
  
  document.querySelectorAll('.play-match-btn').forEach(btn => {
    if (btn instanceof HTMLButtonElement) {
      btn.disabled = true;
    }
  });
  
  const championElement = document.getElementById('championName');
  if (championElement) championElement.textContent = 'TBD';
  
  const bracketContainer = document.getElementById('bracket-container');
  const emptyState = document.getElementById('empty-state');
  if (bracketContainer) bracketContainer.style.display = 'none';
  if (emptyState) emptyState.style.display = 'flex';
  
  updateLobbyDisplay();
}

export function initializeTournamentEvents() {

  (window as any).ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/chat`);
  (window as any).ws.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.type === 'notify_tournament') {
      console.log("notify_tournament", data.content);
    }
  };
  generateQuarterFinals();
  // updateLobbyDisplay();
  cleanStart();

  const homeBtn = document.getElementById('homeBtn');

  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.history.pushState({}, '', '/main');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }

}
