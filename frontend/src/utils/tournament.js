// Tournament state
let tournamentData = {
  players: [],
  matches: {},
  currentRound: 'qf'
};

// Add player function
window.addPlayer = function() {
  const playerNumber = tournamentData.players.length + 1;
  const playerName = 'Player ' + playerNumber;
  
  if (tournamentData.players.length < 8) {
    tournamentData.players.push(playerName);
    updateTournamentDisplay();
    return 1; 
  }
  return 0; 
};

window.closeModal = function() {
  document.getElementById('addPlayerModal').style.display = 'none';
  document.getElementById('playerNameInput').value = '';
};

window.confirmAddPlayer = function() {
  const playerName = document.getElementById('playerNameInput').value.trim();
  if (playerName && tournamentData.players.length < 8) {
    tournamentData.players.push(playerName);
    updateTournamentDisplay();
    closeModal();
    return 1;   
  }
  return 0; 
};

function generateQuarterFinals() {
  const qfMatchesContainer = document.getElementById('qf-matches');
  qfMatchesContainer.innerHTML = '';
  
  for (let i = 1; i <= 4; i++) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'match';
    matchDiv.setAttribute('data-match', 'qf' + i);
    
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
      '<button class="play-match-btn" onclick="playMatch(\'qf' + i + '\')" disabled>' +
        '<i class="fas fa-play"></i>' +
        'Play Match' +
      '</button>';
    
    qfMatchesContainer.appendChild(matchDiv);
  }
}

function updateTournamentDisplay() {
  document.getElementById('playerCount').textContent = tournamentData.players.length + '/8 Players';
  
  const statusElement = document.getElementById('tournamentStatus');
  if (tournamentData.players.length === 8) {
    statusElement.textContent = 'Ready to start!';
  } else {
    statusElement.textContent = 'Waiting for players';
  }
  
  const emptyState = document.getElementById('empty-state');
  const bracketContainer = document.getElementById('bracket-container');
  
  if (tournamentData.players.length === 0) {
    emptyState.style.display = 'flex';
    bracketContainer.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    bracketContainer.style.display = 'flex';
    
    document.getElementById('qf-round').style.display = 'flex';
    
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

    const sfRound = document.getElementById('sf-round');
    const finalRound = document.getElementById('final-round');
    const championRound = document.getElementById('champion-round');
    
    if (tournamentData.players.length >= 4) {
      sfRound.style.display = 'flex';
    } else {
      sfRound.style.display = 'none';
    }
    
    if (tournamentData.players.length >= 2) {
      finalRound.style.display = 'flex';
    } else {
      finalRound.style.display = 'none';
    }
    
    championRound.style.display = 'none';
  }

  updatePlayButtons();
}

function updatePlayButtons() {
  const qfButtons = document.querySelectorAll('[data-match^="qf"] .play-match-btn');
  qfButtons.forEach(btn => {
    btn.disabled = tournamentData.players.length < 8;
  });
}

window.playMatch = function(matchId) {
  console.log('Playing match:', matchId);
  simulateMatch(matchId);
};

function simulateMatch(matchId) {
  const match = document.querySelector('[data-match="' + matchId + '"]');
  const players = match.querySelectorAll('.player');
  
  const winner = Math.random() < 0.5 ? 0 : 1;
  players[winner].classList.add('winner');
  players[winner].querySelector('.player-score').textContent = '1';
  
  const winnerName = players[winner].querySelector('.player-name').textContent;
  advanceWinner(matchId, winnerName);
  
  match.querySelector('.play-match-btn').disabled = true;
}

function advanceWinner(matchId, winnerName) {
  console.log('Advancing winner:', winnerName, 'from match:', matchId);
  
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
        
        checkAndEnableNextMatch(nextMatch);
      }
    }
    
    if (matchId === 'final') {
      document.getElementById('championName').textContent = winnerName;
      document.getElementById('champion-round').style.display = 'flex';
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

window.resetTournament = function() {
  tournamentData = {
    players: [],
    matches: {},
    currentRound: 'qf'
  };
  
  document.querySelectorAll('.player').forEach(player => {
    player.classList.remove('winner');
    player.classList.add('empty');
    player.querySelector('.player-score').textContent = '0';
  });
  
  for (let i = 1; i <= 8; i++) {
    const playerElement = document.querySelector('[data-player="' + i + '"] .player-name');
    if (playerElement) {
      playerElement.textContent = 'Player ' + i;
      playerElement.parentElement.classList.add('empty');
    }
  }
  
  document.querySelectorAll('[data-winner-from]').forEach(element => {
    const winnerFrom = element.getAttribute('data-winner-from');
    element.querySelector('.player-name').textContent = 'Winner ' + winnerFrom.toUpperCase();
    element.classList.add('empty');
  });
  
  document.querySelectorAll('.play-match-btn').forEach(btn => {
    btn.disabled = true;
  });
  
  document.getElementById('championName').textContent = 'TBD';
  
  document.getElementById('bracket-container').style.display = 'none';
  document.getElementById('empty-state').style.display = 'flex';
  
  updateTournamentDisplay();
};

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
document.addEventListener('DOMContentLoaded', function() {
  generateQuarterFinals();
  updateTournamentDisplay();
}); 