import { getUserGameHistory } from '../../game/gameUtils';
import { t } from '../../utils/translations';

export async function renderGameHistory(username: string) {
	const games = await getUserGameHistory(username);
	
	const formatDate = (timestamp: string) => {
		if (!timestamp) return 'N/A';
		const date = new Date(parseInt(timestamp));
		return date.toLocaleString();
	};

	const getGameResult = (game: any, username: string) => {
		if (!game.winner) return 'En cours';
		if (game.winner === username) return 'Victoire';
		return 'Défaite';
	};

	const getGameTypeLabel = (gameType: string) => {
		switch (gameType) {
			case 'pong':
				return 'Pong';
			case 'block':
				return 'Block';
			default:
				return gameType;
		}
	};

	const gamesHtml = games.length > 0 
		? games.map(game => `
			<div class="game-item">
				<div class="game-info">
					<div class="game-type">${getGameTypeLabel(game.game_type)}</div>
					<div class="game-players">
						<span class="player">${game.player1}</span>
						${game.player2 ? `<span class="vs">vs</span><span class="player">${game.player2}</span>` : ''}
						${game.player3 ? `<span class="vs">vs</span><span class="player">${game.player3}</span>` : ''}
						${game.player4 ? `<span class="vs">vs</span><span class="player">${game.player4}</span>` : ''}
					</div>
					<div class="game-result ${getGameResult(game, username).toLowerCase()}">
						${getGameResult(game, username)}
					</div>
				</div>
				<div class="game-date">
					${formatDate(game.end_time || '')}
				</div>
			</div>
		`).join('')
		: '<div class="no-games">Aucune partie trouvée</div>';

	const htmlContent = `
		<div class="game-history-wrapper">
			<div class="game-history-container">
				<div class="game-history-header">
					<button class="back-button" id="backBtn">
						<i class="fas fa-arrow-left"></i>
						Retour
					</button>
					<h1>Historique des parties - ${username}</h1>
				</div>
				
				<div class="game-history-content">
					<div class="games-list">
						${gamesHtml}
					</div>
				</div>
			</div>
		</div>

		<style>
			.game-history-wrapper {
				height: 100vh;
				display: flex;
				justify-content: center;
				align-items: center;
				background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
			}

			.game-history-container {
				width: 90%;
				max-width: 800px;
				background: rgba(255, 255, 255, 0.1);
				backdrop-filter: blur(10px);
				border-radius: 20px;
				padding: 30px;
				box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
				border: 1px solid rgba(255, 255, 255, 0.18);
				color: white;
			}

			.game-history-header {
				display: flex;
				align-items: center;
				gap: 20px;
				margin-bottom: 30px;
			}

			.back-button {
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

			.back-button:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: translateY(-2px);
			}

			.game-history-header h1 {
				margin: 0;
				font-size: 1.8em;
			}

			.games-list {
				display: flex;
				flex-direction: column;
				gap: 15px;
			}

			.game-item {
				background: rgba(255, 255, 255, 0.05);
				border-radius: 15px;
				padding: 20px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				transition: all 0.3s ease;
			}

			.game-item:hover {
				background: rgba(255, 255, 255, 0.1);
				transform: translateY(-2px);
			}

			.game-info {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}

			.game-type {
				font-weight: bold;
				color: #4a90e2;
				font-size: 1.1em;
			}

			.game-players {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-wrap: wrap;
			}

			.player {
				font-weight: 500;
			}

			.vs {
				color: #ccc;
				font-size: 0.9em;
			}

			.game-result {
				font-weight: bold;
				padding: 4px 12px;
				border-radius: 20px;
				font-size: 0.9em;
				text-align: center;
				display: inline-block;
				width: fit-content;
			}

			.game-result.victoire {
				background: rgba(46, 204, 113, 0.2);
				color: #2ecc71;
			}

			.game-result.défaite {
				background: rgba(231, 76, 60, 0.2);
				color: #e74c3c;
			}

			.game-result.en cours {
				background: rgba(241, 196, 15, 0.2);
				color: #f1c40f;
			}

			.game-date {
				color: #ccc;
				font-size: 0.9em;
				text-align: right;
			}

			.no-games {
				text-align: center;
				color: #ccc;
				font-style: italic;
				padding: 40px;
			}

			@media (max-width: 768px) {
				.game-history-container {
					padding: 20px;
				}

				.game-history-header {
					flex-direction: column;
					text-align: center;
					gap: 15px;
				}

				.game-item {
					flex-direction: column;
					align-items: flex-start;
					gap: 15px;
				}

				.game-date {
					text-align: left;
				}
			}
		</style>
	`;

	setTimeout(() => {
		const backBtn = document.getElementById('backBtn');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				window.history.back();
			});
		}
	}, 0);

	return htmlContent;
} 