import { Pong } from '../../game/pong/pong';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';

export function renderTournaments() {
  const html =  `

<div class="tournaments-container">
  <canvas id="gameCanvas" width="800" height="600"></canvas>

  <div class="tournaments-header">
    <button class="home-button" id="homeBtn" onclick="returnHome()">
        <i class="fas fa-home"></i>
         ${t('social.home')}
    </button>
    <h1 class="tournaments-title">
      <i class="fas fa-trophy"></i>
      Tournament Lobby
    </h1>
    <div class="tournaments-actions">
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
    padding: 16px 0 0 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
  }

  .tournaments-container {
    position: relative;
    z-index: 1;
    padding: 20px;
    padding-top: 7%;
    max-width: 1400px;
    margin: 48px auto 0 auto;
    color: white;
    max-height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .tournaments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
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

  #gameCanvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
  }
  #gameCanvas.active {
    opacity: 1;
    pointer-events: auto;
  }

  .tournaments-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .tournaments-title i {
    color: #ffd700;
  }

  .tournaments-actions {
    margin-right: 10%;
    display: flex;
    gap: 10px;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .btn-success {
    background: linear-gradient(45deg, #4CAF50 0%, #45a049 100%);
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .tournament-info-bar {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
    padding: 15px 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    backdrop-filter: blur(5px);
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ccc;
  }

  .info-item i {
    color: #667eea;
  }

  /* Lobby Styles */
  .lobby-container {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 30px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .lobby-title {
    text-align: center;
    color: #667eea;
    font-size: 2rem;
    font-weight: bold;
    margin: 0 0 25px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
  }

  .lobby-title i {
    color: #ffd700;
  }

  .players-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }

  .player-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
  }

  .player-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .player-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }

  .player-number {
    color: #ccc;
    font-size: 0.9rem;
  }

  .remove-player {
    background: rgba(255, 0, 0, 0.2);
    border: 1px solid rgba(255, 0, 0, 0.3);
    color: #ff6b6b;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .remove-player:hover {
    background: rgba(255, 0, 0, 0.3);
    color: #ff4444;
  }

  .lobby-actions {
    text-align: center;
  }

  .bracket-container {
    display: flex;
    flex-direction: row;
    gap: 40px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    backdrop-filter: blur(5px);
    overflow-x: auto;
    align-items: flex-start;
  }

  .bracket-round {
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex-shrink: 0;
  }

  .round-title {
    text-align: center;
    color: #667eea;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
  }

  .matches {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-items: center;
  }

  .match {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 10px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    width: 100%;
    max-width: none;
  }

  .match:hover {
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
  }

  .final-match {
    border: 2px solid #ffd700;
    background: rgba(255, 215, 0, 0.1);
  }

  .match-players {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }

  .player {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
    border-left: 3px solid #667eea;
  }

  .player.winner {
    background: rgba(76, 175, 80, 0.2);
    border-left-color: #4CAF50;
  }

  .player.empty {
    opacity: 0.5;
    font-style: italic;
  }

  .player-name {
    font-weight: bold;
  }

  .player-score {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ffd700;
  }

  .vs {
    text-align: center;
    font-weight: bold;
    color: #667eea;
    font-size: 0.9rem;
  }

  .play-match-btn {
    width: 100%;
    padding: 8px;
    background: linear-gradient(45deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .play-match-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
  }

  .champion-podium {
    display: flex;
    justify-content: center;
    align-items: center;
    height: auto;
    min-height: 150px;
  }

  .champion-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 30px;
    background: linear-gradient(45deg, #ffd700 0%, #ffed4e 100%);
    color: #333;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.2rem;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
    text-align: center;
    min-width: 180px;
    max-width: 250px;
  }

  .champion-slot i {
    font-size: 3rem;
  }

  /* Modal Styles */
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: rgba(0, 0, 0, 0.9);
    margin: 15% auto;
    padding: 0;
    border-radius: 15px;
    width: 90%;
    max-width: 400px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h3 {
    margin: 0;
    color: white;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .close-btn:hover {
    color: #667eea;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-body input {
    width: 100%;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 16px;
    margin-bottom: 20px;
    box-sizing: border-box;
  }

  .modal-body input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .error-message {
    color: #ff6b6b;
    font-size: 0.9rem;
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
    background: rgba(0, 0, 0, 0.3);
    padding: 40px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 400px;
  }

  .empty-icon {
    font-size: 4rem;
    color: #ffd700;
    margin-bottom: 20px;
  }

  .empty-state-content h2 {
    color: white;
    margin: 0 0 15px 0;
    font-size: 2rem;
  }

  .empty-state-content p {
    color: #ccc;
    margin: 0 0 25px 0;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .tournaments-header {
      flex-direction: column;
      gap: 15px;
      padding: 8px 8px;
    }

    .home-button {
      width: 100%;
      justify-content: center;
    }

    .tournaments-container {
      margin-top: 16px;
    }
    .tournament-info-bar {
      flex-direction: column;
      gap: 10px;
    }
    .matches {
      grid-template-columns: 1fr;
    }
    .players-list {
      grid-template-columns: 1fr;
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
  if (playerName && tournamentData.players.length < 8 && (!displayInput || displayInput.style.display === 'none')) {
    // Première étape : valider le username
    const response = await fetch(`/api/user/${playerName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
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
  
  if (playerCount <= 2) {
    matchCount = 1; // Final only
    matchPrefix = 'final';
  } else if (playerCount <= 4) {
    matchCount = 2; // 2 semi-finals for 4 players
    matchPrefix = 'sf';
  } else {
    matchCount = 4; // Quarter-finals
    matchPrefix = 'qf';
  }
  
  for (let i = 1; i <= matchCount; i++) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'match';
    matchDiv.setAttribute('data-match', matchPrefix + i);
    
    const player1Num = (i - 1) * 2 + 1;
    const player2Num = (i - 1) * 2 + 2;
    
    matchDiv.innerHTML = 
      '<div class="match-players">' +
        '<div class="player player-1" data-player="' + player1Num + '">' +
          '<span class="player-name">Player ' + player1Num + '</span>' +
          '<span class="player-score">0</span>' +
        '</div>' +
        '<div class="vs">VS</div>' +
        '<div class="player player-2" data-player="' + player2Num + '">' +
          '<span class="player-name">Player ' + player2Num + '</span>' +
          '<span class="player-score">0</span>' +
        '</div>' +
      '</div>' +
      '<button class="play-match-btn" onclick="playMatch(\'' + matchPrefix + i + '\')" disabled>' +
        '<i class="fas fa-play"></i>' +
        'Play Match' +
      '</button>';
    
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
  const p1 = players[0].querySelector('.player-name')?.textContent;
  const p2 = players[1].querySelector('.player-name')?.textContent;
  const game = new Pong(canvas);
  if (canvas) {
    canvas.classList.add('active');
  }
  game.init(p1!, p2!);
  canvas.focus();
  console.log("game.paddles[0].name :", p1, "game.paddles[1].name :", p2);
  
  const checkGameEnd = () => {
    if (game.end) {
      const p1 = game.paddles[0];
      const p2 = game.paddles[1];
      const winner = p1.score > p2.score ? p1.name : p2.name;
      console.log("p1 :", p1.name, "p2 :", p2.name, "winner :", winner);
      const match = document.querySelector('[data-match="' + matchId + '"]');
      if (match) {
        console.log("match found");
        const players = match.querySelectorAll('.player');
        const winnerIndex = p1.score > p2.score ? 0 : 1;
        const winnerElement = players[winnerIndex] as HTMLElement;
        
        if (winnerElement) {
          console.log("winnerElement found");
          winnerElement.classList.add('winner');
          const scoreElement = winnerElement.querySelector('.player-score');
          if (scoreElement) {
            console.log("scoreElement found", scoreElement.textContent, Math.max(p1.score, p2.score));
            scoreElement.textContent = Math.max(p1.score, p2.score).toString();
          }
          
          const winnerNameElement = winnerElement.querySelector('.player-name');
          if (winnerNameElement && winner) {
            advanceWinner(matchId, winner);
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

export function initializeTournamentEvents() {
  console.log("test");
  generateQuarterFinals();
  updateLobbyDisplay();

}

