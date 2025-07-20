import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';
import { profil } from './profil';

export function renderProfil(uuid: string) {
	return getTemplate();
}

export async function initializeProfilEvents(uuid: string) {
	console.log('Initializing profil page events');
	try {

		const me = await loadMe();
		const user = await loadUserInfo(uuid);

		if (!me || !user) {
			console.error("ya pas les infos de celui qui va sur la page // celui dont on veut voir le profil")
			return ;
		}

		const [ stats, friends, relation ] = await Promise.all([
			loadUserStats(uuid),
			loadUserFriends(uuid),
			loadRelation(me.username, user.username)
		]);

		const data = {
			me,
			user,
			stats,
			friends,
			relation
		};

		console.log(JSON.stringify(data.me, null, 12))
		console.log(JSON.stringify(data.user, null, 12))
		console.log(JSON.stringify(data.stats, null, 12))
		console.log(JSON.stringify(data.friends, null, 12))

		new profil(data);

	}
	catch (err: any) {
		console.log(err);
	}

	const homeBtn = document.getElementById('homeBtn') as HTMLElement;

	if (homeBtn) {
		homeBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}
}

async function loadRelation(user1: string, user2: string) {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch('/api/friend/relation', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			},
			body: JSON.stringify({
				user1: user1,
				user2: user2,
			})
		});

		if (response.ok) {
			const result = await response.json();
			return (result);
		} else {
			console.error('Erreur lors de la récupération des données utilisateur');
		}
	} catch (err) {
		console.error(`fail de recup me dans loadme renderFriends`);
	}

}

async function loadMe() {
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
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
			};
			return (userData);
		} else {
			console.error('Erreur lors de la récupération des données utilisateur');
		}
	} catch (err) {
		console.error(`fail de recup me dans loadme renderFriends`);
	}
}

async function loadUserInfo(username: string) {

	console.log(username)
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch(`/api/user/username/?username=${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			}
		});

		if (response.ok) {
			const result = await response.json();
			const userData = {
				id: result.data?.id,
				username: sanitizeHtml(result.data?.username),
				email: sanitizeHtml(result.data?.email),
				avatar: sanitizeHtml(result.data?.avatar_url) || 'avatar.png',
			};
			return (userData);
		} else
			console.error('Erreur lors de la récupération des données utilisateur');
	} catch (err) {
		console.error(`error retreve info du user pour render son profil  ${err}`);
	}
}

async function loadUserStats(username: string) {
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch(`/api/user/stats/?username=${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			}
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
			return (userStats);
		} else
			console.error('pblm recuperer les stats du user dont on veut render le profil');
	} catch (err) {
		console.error(`pblm recuperer les stats du user dont on veut render le profil${err}`);
	}
}

async function loadUserFriends(username: string) {
	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return '';
		}

		const response = await fetch(`/api/friend/?username=${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			}
		});

		if (response.ok)
			return await response.json();
		else
			console.error('gros gros zig');

	} catch (err) {
		console.error(`pas réussi a récup les amis de cette personnes zignew que tu es`);
	}
}

function getTemplate() {
	return `
		<button class="home-button" id="homeBtn">
			<i class="fas fa-home"></i>
			${t('social.home')}
		</button>
		
		<button class="home-button" onclick="goHome()">
        <i class="fas fa-home"></i>
        ${t('social.home')}
		</button>

		<div class="container">
			<div class="profile-header">
			<div class="profile-banner">
				<div class="profile-avatar">
				<i class="fas fa-user"></i>
				</div>
			</div>
			<div class="profile-info">
				<div class="profile-details">
				<h1 id="username"> talan</h1>
				<div class="profile-status">
					<div class="status-dot"></div>
					<span>${t('social.online')}</span>
				</div>
				</div>
				<div class="profile-actions">
					<button id="addFriend" "class="action-btn btn-primary">
						<i class="fas fa-user-plus"></i>
						${t('social.addFriend')}
					</button>
					<button id="sendMsg" class="action-btn btn-secondary">
						<i class="fas fa-envelope"></i>
						${t('social.message')}
					</button>
				</div>
			</div>
			</div>

			<div class="profile-content">
			<div class="profile-section">
				<div class="section-header">
				<i class="fas fa-chart-bar"></i>
				<h2>${t('social.statistics')}</h2>
				</div>
					<div class="stats-grid">
						<div class="stat-card">
							<div id="gamePlayed" class="stat-number">1,247</div>
													<div class="stat-label">${t('social.gamePlayed')}</div>
					</div>
					<div class="stat-card">
						<div id="winrate" class="stat-number">68%</div>
						<div class="stat-label">${t('social.winrate')}</div>
					</div>
					<div class="stat-card">
						<div id="victory" class="stat-number">42</div>
						<div class="stat-label">${t('social.victory')}</div>
						</div>
						<div class="stat-card">
							<div id="rank" class="stat-number">42</div>
							<div class="stat-label">Rank</div>
						</div>
					</div>
			</div>

			

			<div id="gameHistory" class="profile-section">
				<div class="section-header">
				<i class="fas fa-history"></i>
				<h2>Historique des parties</h2>
				</div>
				<div class="match-history-container" id="match-history-list">
					<!-- Les parties seront générées par JavaScript -->
				</div>
			</div>

			<div class="profile-section friends-section">
				<div class="section-header">
				<i class="fas fa-users"></i>
				<h2>Amis</h2>
				</div>
				<div class="friends-grid">
				<div class="friend-card">
					<div class="friend-avatar">M</div>
					<div class="friend-name">Marie_G</div>
					<div class="friend-status">En partie</div>
				</div>
				<div class="friend-card">
					<div class="friend-avatar">T</div>
					<div class="friend-name">Thomas_42</div>
					<div class="friend-status">${t('social.online')}</div>
				</div>
				<div class="friend-card">
					<div class="friend-avatar">S</div>
					<div class="friend-name">Sophie_K</div>
					<div class="friend-status">${t('social.online')}</div>
				</div>
				<div class="friend-card">
					<div class="friend-avatar">L</div>
					<div class="friend-name">Lucas_Dev</div>
					<div class="friend-status">Absent</div>
				</div>
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


        .profile-avatar {
		position: absolute;
		bottom: -30px;
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
        }

        .status-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #10B981;
		animation: pulse 2s infinite;
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

        .match-history-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-height: 400px;
		overflow-y: auto;
        }

        .match-history-container::-webkit-scrollbar {
		width: 6px;
        }

        .match-history-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 3px;
        }

        .match-history-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
        }

        .match-history-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
        }

        .match-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 15px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		border-left: 4px solid;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
        }

        .match-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
        }

        .match-item:hover::before {
		opacity: 1;
        }

        .match-item:hover {
		transform: translateX(5px);
		background: rgba(255, 255, 255, 0.15);
        }

        .match-item.victory {
		border-left-color: #10B981;
        }

        .match-item.defeat {
		border-left-color: #EF4444;
        }

        .match-item.draw {
		border-left-color: #6B7280;
        }

        .match-icon {
		width: 45px;
		height: 45px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2em;
		color: white;
		flex-shrink: 0;
        }

        .match-icon.pong {
		background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        }

        .match-icon.block {
		background: linear-gradient(135deg, #8B5CF6, #7C3AED);
        }

        .match-content {
		flex: 1;
		min-width: 0;
        }

        .match-result {
		font-size: 1.1rem;
		font-weight: 700;
		margin-bottom: 4px;
        }

        .match-item.victory .match-result {
		color: #10B981;
        }

        .match-item.defeat .match-result {
		color: #EF4444;
        }

        .match-item.draw .match-result {
		color: #6B7280;
        }

        .match-details {
		display: flex;
		align-items: center;
		gap: 15px;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.8);
        }

        .match-opponent {
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
        }

        .match-score {
		background: rgba(255, 255, 255, 0.1);
		padding: 4px 8px;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.85rem;
        }

        .match-date {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.8rem;
		margin-left: auto;
		flex-shrink: 0;
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