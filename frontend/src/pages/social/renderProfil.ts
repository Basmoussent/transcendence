import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';
import { profil } from './profil'

// Stocker l'instance actuelle pour pouvoir la nettoyer
let currentProfilInstance: profil | null = null;

export async function initializeProfilEvents(uuid:string) {
	try {
		// Nettoyer l'instance précédente si elle existe
		if (currentProfilInstance) {
			currentProfilInstance.cleanup();
			currentProfilInstance = null;
		}

		const me = await loadMe();
		const user = await loadUserInfo(uuid);
		console.log("online lq voir ", user)

		if (!me || !user) {
			console.error("ya pas les infos");
			return;
		}

		const [ stats, relation ] = await Promise.all([
			loadUserStats(uuid),
			loadRelation(me.username, user.username)
		]);

		if (!stats)
			console.error("Données manquantes pour afficher le profil");

		const data = { me, user, stats, relation };

		console.log(JSON.stringify(data, null, 8))

		await new Promise(resolve => requestAnimationFrame(resolve));
 
		// Créer et stocker la nouvelle instance
		currentProfilInstance = new profil(data);
	}
	catch (err) {
		console.log(err);
	}
}

// Fonction pour nettoyer l'instance actuelle (appelée lors de la navigation)
export function cleanupProfilInstance() {
	if (currentProfilInstance) {
		currentProfilInstance.cleanup();
		currentProfilInstance = null;
	}
}


export function renderProfil() {
	return `
		<button class="home-button" id="homeBtn">
			<i class="fas fa-home"></i>
			Home
		</button>
		
		<div class="container">
			<div class="profile-header">
			<div class="profile-banner">
				<div class="profile-avatar">
				<img src="" id="avatar">
				</div>
			</div>
			<div class="profile-info">
				<div class="profile-details">
				<h1 id="username"> talan</h1>
				<div class="profile-status">
					<div class="status-dot" id="statusDot"></div>
					<span id="online">En ligne</span>
				</div>
				</div>
				<div class="profile-actions">
					<button id="addFriend" class="action-btn btn-primary">
						<i class="fas fa-user-plus"></i>
						Ajouter ami 
					</button>
					<button id="blockBtn" class="action-btn btn-primary">
						<i class="fas fa-ban"></i>
						Bloquer
					</button>
				</div>
			</div>
			</div>

			<div class="profile-content">
			<div class="profile-section">
				<div class="section-header">
				<i class="fas fa-chart-bar"></i>
				<h2>Statistiques</h2>
				</div>
					<div class="stats-grid">
						<div class="stat-card">
							<div id="gamePlayed" class="stat-number"></div>
							<div class="stat-label">Game played</div>
						</div>
						<div class="stat-card">
							<div id="winrate" class="stat-number"></div>
							<div class="stat-label">Winrate</div>
						</div>
						<div class="stat-card">
							<div id="mmr" class="stat-number"></div>
							<div class="stat-label">MMR</div>
						</div>
						<div class="stat-card">
							<div id="rank" class="stat-number"></div>
							<div class="stat-label">Rank ;)</div>
					</div>
				</div>
			</div>

			

			<div id="gameHistory" class="profile-section">
				<div class="section-header">
				<i class="fas fa-history"></i>
				<h2>Activité récente</h2>
				</div>
				<div class="recent-activity">
				<div class="activity-item">
					<div class="activity-icon">
					<i class="fas fa-gamepad"></i>
					</div>
					<div class="activity-content">
					<h4>Partie de Pong remportée</h4>
					<p>Victoire contre Marie_G dans une partie serrée</p>
					</div>
					<div class="activity-time">Il y a 2h</div>
				</div>
				<div class="activity-item">
					<div class="activity-icon">
					<i class="fas fa-trophy"></i>
					</div>
					<div class="activity-content">
					<h4>Nouveau succès débloqué</h4>
					<p>Succès "Série de feu" obtenu</p>
					</div>
					<div class="activity-time">Il y a 1 jour</div>
				</div>
				<div class="activity-item">
					<div class="activity-icon">
					<i class="fas fa-users"></i>
					</div>
					<div class="activity-content">
					<h4>Nouvel ami ajouté</h4>
					<p>Thomas_42 a accepté votre demande d'ami</p>
					</div>
					<div class="activity-time">Il y a 3 jours</div>
				</div>
				<div class="activity-item">
					<div class="activity-icon">
					<i class="fas fa-users"></i>
					</div>
					<div class="activity-content">
					<h4>Nouvel ami ajouté</h4>
					<p>Thomas_42 a accepté votre demande d'ami</p>
					</div>
					<div class="activity-time">Il y a 3 jours</div>
				</div>
				</div>
			</div>
		</div>
			
	<style>
        * {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
        }

        body {
		font-family: 'Arial', sans-serif;
		background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
		min-height: 100vh;
		color: white;
		position: relative;
		overflow-x: hidden;
        }

        body::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
		z-index: -1;
        }

        .home-button {
		position: fixed;
		top: 20px;
		left: 20px;
		padding: 10px 15px;
		font-size: 1em;
		border: none;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 100;
        }

        .home-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
        }

        .container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		padding-top: 80px;
        }

        .profile-header {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border-radius: 20px;
		padding: 30px;
		margin-bottom: 30px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		animation: slideDown 0.8s ease-out;
        }

        .profile-banner {
		position: relative;
		height: 200px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 15px;
		margin-bottom: 20px;
		overflow: hidden;
        }

        .profile-banner::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="70" cy="80" r="2.5" fill="rgba(255,255,255,0.1)"/></svg>');
		animation: float 6s ease-in-out infinite;
        }

	#gameHistory {
		max-height: 400px; /* Ou la hauteur fixe que tu souhaites */
		overflow-y: auto;
		padding-right: 10px; /* Pour éviter que la scrollbar ne cache du contenu */
	}

	/* Styles pour les éléments d'historique des parties */
	.game-history-item {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 15px;
		padding: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.3s ease;
		flex-wrap: wrap;
		gap: 15px;
		margin-bottom: 15px;
	}

	.game-history-item:hover {
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

	.recent-activity {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	@media (max-width: 768px) {
		.game-history-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}

		.game-date {
			text-align: left;
		}
	}


        .profile-avatar {
		position: absolute;
		bottom: 30px;
		left: 30px;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, #10B981 0%, #059669 100%);
		border: 5px solid rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5em;
		font-weight: bold;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
        }

        /* Ajout pour arrondir l'image avatar et la faire remplir le cadre */
        .profile-avatar img#avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
        }

        .profile-avatar:hover {
		transform: scale(1.05);
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }

        .profile-info {
		margin-top: 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
        }

        .profile-details h1 {
		font-size: 2.5em;
		margin-bottom: 10px;
		background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
        }

        .profile-meta {
		display: flex;
		gap: 20px;
		margin-bottom: 15px;
        }

        .meta-item {
		display: flex;
		align-items: center;
		gap: 8px;
		color: rgba(255, 255, 255, 0.8);
        }

        		.profile-status {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 15px;
		background: rgba(16, 185, 129, 0.2);
		border-radius: 20px;
		border: 1px solid rgba(16, 185, 129, 0.3);
		transition: all 0.3s ease;
        }

		.profile-status.offline {
			background: rgba(107, 114, 128, 0.2);
			border: 1px solid rgba(107, 114, 128, 0.3);
		}

		/* Styles pour le statut en ligne/hors ligne */
		.online-status {
			color: #10B981;
			font-weight: 600;
		}

		.offline-status {
			color: #6B7280;
			font-weight: 600;
		}

		.status-dot {
			width: 12px;
			height: 12px;
			border-radius: 50%;
			animation: pulse 2s infinite;
		}

		.status-dot.online {
			background: #10B981;
		}

		.status-dot.offline {
			background: #6B7280;
		}

		@keyframes pulse {
			0% {
				opacity: 1;
			}
			50% {
				opacity: 0.5;
			}
			100% {
				opacity: 1;
			}
		}

        .profile-actions {
		display: flex;
		gap: 15px;
        }

        .action-btn {
		padding: 12px 20px;
		border: none;
		border-radius: 10px;
		font-size: 1em;
		font-weight: bold;
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 8px;
        }

        .btn-primary {
		background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
        }

        .btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .action-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .profile-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30px;
        }

        .profile-section {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border-radius: 15px;
		padding: 25px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		animation: slideUp 0.8s ease-out;
        }

        .section-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
        }

        .section-header h2 {
		font-size: 1.5em;
		color: white;
        }

        .section-header i {
		color: #60A5FA;
		font-size: 1.2em;
        }

        .stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 15px;
        }

        .stat-card {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 20px;
		text-align: center;
		transition: all 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		background: rgba(255, 255, 255, 0.15);
        }

        .stat-number {
		font-size: 2em;
		font-weight: bold;
		color: #60A5FA;
		margin-bottom: 5px;
        }

        .stat-label {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9em;
        }

        .achievement-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
        }

        .achievement-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 15px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		transition: all 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .achievement-item:hover {
		transform: translateX(5px);
		background: rgba(255, 255, 255, 0.15);
        }

        .achievement-icon {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2em;
		color: white;
        }

        .achievement-info h3 {
		color: white;
		margin-bottom: 5px;
        }

        .achievement-info p {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9em;
        }

        .recent-activity {
		display: flex;
		flex-direction: column;
		gap: 15px;
        }

        .activity-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 15px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		border-left: 4px solid #3B82F6;
		transition: all 0.3s ease;
        }

        .activity-item:hover {
		transform: translateX(5px);
		background: rgba(255, 255, 255, 0.15);
        }

        .activity-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(59, 130, 246, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #60A5FA;
        }

        .activity-content {
		flex: 1;
        }

        .activity-content h4 {
		color: white;
		margin-bottom: 5px;
        }

        .activity-content p {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9em;
        }

        .activity-time {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.8em;
        }

        .friends-section {
		grid-column: 1 / -1;
        }

        .friends-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
        }

        .friend-card {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 15px;
		padding: 20px;
		text-align: center;
		transition: all 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .friend-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		background: rgba(255, 255, 255, 0.15);
        }

        .friend-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
		margin: 0 auto 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5em;
		color: white;
		font-weight: bold;
        }

        .friend-name {
		color: white;
		font-weight: bold;
		margin-bottom: 5px;
        }

        .friend-status {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9em;
        }

        @keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
        }

        @keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
        }

        @keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
        }

        @keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
        }

        @media (max-width: 768px) {
		.profile-content {
			grid-template-columns: 1fr;
		}

		.profile-info {
			flex-direction: column;
			align-items: flex-start;
			gap: 20px;
		}

		.profile-actions {
			width: 100%;
			justify-content: center;
		}

		.friends-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
        }


    	</style>`;
}

export async function loadRelation(user1: string, user2: string) {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return null;
		}
		const response = await fetch('/api/friend/relation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			},
			body: JSON.stringify({
				user1: user1,
				user2: user2,
			})
		});
		console.log(response)
		if (response.ok) {
			const result = await response.json();
			return result;
		} else {
			console.error('Erreur lors de la récupération des données utilisateur');
			return null;
		}
	} catch (err) {
		console.error(`fail de recup me dans loadme renderFriends`, err);
		return null;
	}

}

async function loadMe() {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return null;
		}

		const response = await fetch('/api/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			}
		});

		if (response.ok) {
			const result = await response.json();
			const userData = {
				username: sanitizeHtml(result.user?.username),
				email: sanitizeHtml(result.user?.email),
				id: result.user.id,
			};
			return userData;
		} else {
			console.error('Erreur lors de la récupération des données utilisateur');
			return null;
		}
	}
	catch (err) {
		console.error(`fail de recup me dans loadme renderFriends`, err);
		return null;
	}

}

async function loadUserInfo(username: string) {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return null;
		}

		console.log("usernam essssttttttttttttt ", username)

		const response = await fetch(`/api/user/username/?username=${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		});
	
		if (response.ok) {
			const result = await response.json();
			const userData = {
				id: result.data?.id,
				username: sanitizeHtml(result.data?.username),
				email: sanitizeHtml(result.data?.email),
				avatar: sanitizeHtml(result.data?.avatar_url) || '../../public/avatar.png',
				online: result.online
			};
			return userData;
		}
		else {
			console.error('Erreur lors de la récupération des données utilisateur');
			return null;
		}
	}
	catch (err) {
		console.error(`error retreve info du user pour render son profil  ${err}`);
		return null;
	}
}

async function loadUserStats(username: string) {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return null;
		}

		const response = await fetch(`/api/user/stats/?username=${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token }
		});
	
		if (response.ok) {
			const result = await response.json();
			const userStats = {
				mmr: result.stats?.mmr,
				pong_games: result.stats?.pong_games,
				pong_wins: result.stats?.pong_wins,
				block_games: result.stats?.block_games,
				block_wins: result.stats?.block_wins,
				rating: result.stats?.rating,
				id: result.stats?.id,
			};
			return userStats;
		}
		else {
			console.error('pblm recuperer les stats du user dont on veut render le profil');
			return null;
		}
	}
	catch (err) {
		console.error(`pblm recuperer les stats du user dont on veut render le profil${err}`);
		return null;
	}

}