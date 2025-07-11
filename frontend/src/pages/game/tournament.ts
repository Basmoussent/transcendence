export function renderTournaments() {
  return `
<div class="tournaments-container">
  <div class="tournaments-header">
    <h1 class="tournaments-title">
      <i class="fas fa-trophy"></i>
      Tournament Bracket
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

  <div class="bracket-container">
    <!-- Champion - EN HAUT -->
    <div class="bracket-round">
      <h3 class="round-title">🏆 Champion</h3>
      <div class="champion-podium">
        <div class="champion-slot">
          <i class="fas fa-crown"></i>
          <span id="championName">TBD</span>
        </div>
      </div>
    </div>

    <!-- Final -->
    <div class="bracket-round">
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

    <!-- Semi Finals -->
    <div class="bracket-round">
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

    <!-- Quarter Finals - EN BAS -->
    <div class="bracket-round">
      <h3 class="round-title">Quarter Finals</h3>
      <div class="matches">
        <div class="match" data-match="qf1">
          <div class="match-players">
            <div class="player player-1" data-player="1">
              <span class="player-name">Player 1</span>
              <span class="player-score">0</span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2" data-player="2">
              <span class="player-name">Player 2</span>
              <span class="player-score">0</span>
            </div>
          </div>
          <button class="play-match-btn" onclick="playMatch('qf1')" disabled>
            <i class="fas fa-play"></i>
            Play Match
          </button>
        </div>

        <div class="match" data-match="qf2">
          <div class="match-players">
            <div class="player player-1" data-player="3">
              <span class="player-name">Player 3</span>
              <span class="player-score">0</span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2" data-player="4">
              <span class="player-name">Player 4</span>
              <span class="player-score">0</span>
            </div>
          </div>
          <button class="play-match-btn" onclick="playMatch('qf2')" disabled>
            <i class="fas fa-play"></i>
            Play Match
          </button>
        </div>

        <div class="match" data-match="qf3">
          <div class="match-players">
            <div class="player player-1" data-player="5">
              <span class="player-name">Player 5</span>
              <span class="player-score">0</span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2" data-player="6">
              <span class="player-name">Player 6</span>
              <span class="player-score">0</span>
            </div>
          </div>
          <button class="play-match-btn" onclick="playMatch('qf3')" disabled>
            <i class="fas fa-play"></i>
            Play Match
          </button>
        </div>

        <div class="match" data-match="qf4">
          <div class="match-players">
            <div class="player player-1" data-player="7">
              <span class="player-name">Player 7</span>
              <span class="player-score">0</span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2" data-player="8">
              <span class="player-name">Player 8</span>
              <span class="player-score">0</span>
            </div>
          </div>
          <button class="play-match-btn" onclick="playMatch('qf4')" disabled>
            <i class="fas fa-play"></i>
            Play Match
          </button>
        </div>
      </div>
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
      <input type="text" id="playerNameInput" placeholder="Enter player name..." maxlength="20">
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
  }

  .tournaments-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    color: white;
  }

  .tournaments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
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
    display: flex;
    align-items: center;
    gap: 8px;
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

  .bracket-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    backdrop-filter: blur(5px);
  }

  .bracket-round {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
    max-width: 280px;
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
    height: 200px;
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
    font-size: 1.5rem;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
    text-align: center;
    min-width: 200px;
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

  @media (max-width: 768px) {
    .tournaments-header {
      flex-direction: column;
      gap: 15px;
    }

    .tournament-info-bar {
      flex-direction: column;
      gap: 10px;
    }

    .matches {
      grid-template-columns: 1fr;
    }
  }
</style>

<script>
// Tournament state
let tournamentData = {
  players: [],
  matches: {},
  currentRound: 'qf'
};

// Add player function
function addPlayer() {
  document.getElementById('addPlayerModal').style.display = 'block';
  document.getElementById('playerNameInput').focus();
}

function closeModal() {
  document.getElementById('addPlayerModal').style.display = 'none';
  document.getElementById('playerNameInput').value = '';
}

function confirmAddPlayer() {
  const playerName = document.getElementById('playerNameInput').value.trim();
  if (playerName && tournamentData.players.length < 8) {
    tournamentData.players.push(playerName);
    updateTournamentDisplay();
    closeModal();
    return 1; // Success
  }
  return 0; // Failed
}

function updateTournamentDisplay() {
  // Update player count
  document.getElementById('playerCount').textContent = tournamentData.players.length + '/8 Players';
  
  // Update tournament status
  const statusElement = document.getElementById('tournamentStatus');
  if (tournamentData.players.length === 8) {
    statusElement.textContent = 'Ready to start!';
  } else {
    statusElement.textContent = 'Waiting for players';
  }
  
  // Update player names in bracket
  for (let i = 0; i < 8; i++) {
    const playerElement = document.querySelector('[data-player="' + (i + 1) + '"] .player-name');
    if (playerElement) {
      if (tournamentData.players[i]) {
        playerElement.textContent = tournamentData.players[i];
        playerElement.parentElement.classList.remove('empty');
      } else {
        playerElement.textContent = 'Player ' + (i + 1);
        playerElement.parentElement.classList.add('empty');
      }
    }
  }

  // Enable/disable play buttons
  updatePlayButtons();
}

function updatePlayButtons() {
  const qfButtons = document.querySelectorAll('[data-match^="qf"] .play-match-btn');
  qfButtons.forEach(btn => {
    btn.disabled = tournamentData.players.length < 8;
  });
}

function playMatch(matchId) {
  console.log('Playing match:', matchId);
  simulateMatch(matchId);
}

function simulateMatch(matchId) {
  const match = document.querySelector('[data-match="' + matchId + '"]');
  const players = match.querySelectorAll('.player');
  
  // Simulate random winner
  const winner = Math.random() < 0.5 ? 0 : 1;
  players[winner].classList.add('winner');
  players[winner].querySelector('.player-score').textContent = '1';
  
  // Advance winner to next round
  const winnerName = players[winner].querySelector('.player-name').textContent;
  advanceWinner(matchId, winnerName);
  
  // Disable the button
  match.querySelector('.play-match-btn').disabled = true;
}

function advanceWinner(matchId, winnerName) {
  console.log('Advancing winner:', winnerName, 'from match:', matchId);
  
  // Map matches to their advancement targets
  const advancement = {
    'qf1': 'sf1-p1',
    'qf2': 'sf1-p2', 
    'qf3': 'sf2-p1',
    'qf4': 'sf2-p2',
    'sf1': 'final-p1',
    'sf2': 'final-p2'
  };
  
  const target = advancement[matchId];
  if (target) {
    const [nextMatch, playerSlot] = target.split('-');
    const nextMatchElement = document.querySelector('[data-match="' + nextMatch + '"]');
    
    if (nextMatchElement) {
      const playerElement = nextMatchElement.querySelector('.player-' + playerSlot.slice(-1) + ' .player-name');
      if (playerElement) {
        playerElement.textContent = winnerName;
        playerElement.parentElement.classList.remove('empty');
        
        // Enable next match button if both players are ready
        checkAndEnableNextMatch(nextMatch);
      }
    }
    
    // Special case for final winner
    if (matchId === 'final') {
      document.getElementById('championName').textContent = winnerName;
    }
  }
}

function checkAndEnableNextMatch(matchId) {
  const match = document.querySelector('[data-match="' + matchId + '"]');
  const players = match.querySelectorAll('.player .player-name');
  
  let bothPlayersReady = true;
  players.forEach(player => {
    if (player.textContent.startsWith('Winner') || player.textContent.startsWith('Player')) {
      bothPlayersReady = false;
    }
  });
  
  if (bothPlayersReady) {
    match.querySelector('.play-match-btn').disabled = false;
  }
}

function resetTournament() {
  tournamentData = {
    players: [],
    matches: {},
    currentRound: 'qf'
  };
  
  // Reset all player elements
  document.querySelectorAll('.player').forEach(player => {
    player.classList.remove('winner');
    player.classList.add('empty');
    player.querySelector('.player-score').textContent = '0';
  });
  
  // Reset player names
  for (let i = 1; i <= 8; i++) {
    const playerElement = document.querySelector('[data-player="' + i + '"] .player-name');
    if (playerElement) {
      playerElement.textContent = 'Player ' + i;
      playerElement.parentElement.classList.add('empty');
    }
  }
  
  // Reset winner slots
  document.querySelectorAll('[data-winner-from]').forEach(element => {
    const winnerFrom = element.getAttribute('data-winner-from');
    element.querySelector('.player-name').textContent = 'Winner ' + winnerFrom.toUpperCase();
    element.classList.add('empty');
  });
  
  // Reset buttons
  document.querySelectorAll('.play-match-btn').forEach(btn => {
    btn.disabled = true;
  });
  
  // Reset champion
  document.getElementById('championName').textContent = 'TBD';
  
  updateTournamentDisplay();
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('addPlayerModal');
  if (event.target === modal) {
    closeModal();
  }
};

// Enter key to add player
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && document.getElementById('addPlayerModal').style.display === 'block') {
    confirmAddPlayer();
  }
});

// Initialize tournament
updateTournamentDisplay();
</script>
  `;
}