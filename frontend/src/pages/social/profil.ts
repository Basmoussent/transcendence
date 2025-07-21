import { getAuthToken } from '../../utils/auth';
import { loadRelation } from './renderProfil'
import { getUserGameHistory } from '../../game/gameUtils';

export class profil {

	private me: any;
	private user: any;
	private stats: any;
	private friends: any;
	private relation: any;
	private recentGames: any[];

	private homeBtn: HTMLElement;
	private username: HTMLElement;
	private addFriendBtn: HTMLElement;
	private blockBtn: HTMLElement;
	private gamePlayed: HTMLElement;
	private winrate: HTMLElement;
	private mmr: HTMLElement;
	private rank: HTMLElement;
	
	private gameHistory: HTMLElement;
	private friendsGrid: HTMLElement;
	private online: HTMLElement;
	private statusDot: HTMLElement;

	constructor (data: any) {

		this.me = data.me;
		this.user = data.user;
		this.stats = data.stats;
		this.friends = data.friends;
		this.relation = data.relation;
		this.recentGames = [];

		this.homeBtn = this.getElement('homeBtn');
		this.username = this.getElement('username');
		this.addFriendBtn = this.getElement('addFriend');
		this.blockBtn = this.getElement('blockBtn');
		this.gamePlayed = this.getElement('gamePlayed');
		this.winrate = this.getElement('winrate');
		this.mmr = this.getElement('mmr');
		this.rank = this.getElement('rank');
		this.gameHistory = this.getElement('gameHistory');
		this.friendsGrid = this.getElement('friends');
		this.online = this.getElement('online');
		this.statusDot = this.getElement('statusDot');

		// recup les relations de /me voir si ya user, 

		// si this.me.username === this.user.username --> pas possible, on redirige vers /me

		this.setupEvents();
		console.log("setupEvents")
		setTimeout(async () => {
			await this.updateInfo();
		}, 0);
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private setupEvents() {

		this.homeBtn.addEventListener('click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new Event('popstate'));
		});

		this.addFriendBtn.addEventListener('click', async () => {
			await this.addFriend();
			this.updateInfo();
		})

		this.blockBtn.addEventListener('click', async () => {

			await this.blockUser();
			this.updateInfo();
		})


	}

	private async updateInfo() {
		console.log("🔍 updateInfo - stats:", this.stats);
		console.log("🔍 updateInfo - user:", this.user);
		console.log("🔍 updateInfo - friends:", this.friends);
		
		// Vérifier que les éléments existent
		if (!this.username) {
			console.error("❌ Element username non trouvé");
			return;
		}
		if (!this.gamePlayed) {
			console.error("❌ Element gamePlayed non trouvé");
			return;
		}
		if (!this.mmr) {
			console.error("❌ Element mmr non trouvé");
			return;
		}
		if (!this.winrate) {
			console.error("❌ Element winrate non trouvé");
			return;
		}
		if (!this.rank) {
			console.error("❌ Element rank non trouvé");
			return;
		}
		if (!this.friendsGrid) {
			console.error("❌ Element friendsGrid non trouvé");
			return;
		}
		if (!this.gameHistory) {
			console.error("❌ Element gameHistory non trouvé");
			return;
		}
		if (!this.online) {
			console.error("❌ Element online non trouvé");
			return;
		}
		if (!this.statusDot) {
			console.error("❌ Element statusDot non trouvé");
			return;
		}

		this.relation = await loadRelation(this.me.username, this.user.username)

		if (this.relation) {
			const myState = this.relation.user_1 == this.me.username ? this.relation.user1_state : this.relation.user2_state;
			const userState = this.relation.user_1 == this.user.username ? this.relation.user1_state : this.relation.user2_state;
	
			// if myState == waiting --> cancel
			// if myState == requested --> accept friend request
			// if myState == normal --> remove friend
	
			// if userState == normal --> bloquer
			// if userState == blocked --> débloquer

		}


		this.username.textContent = this.user.username || 'Utilisateur inconnu';
		
		// Mettre à jour le statut en ligne/hors ligne
		this.updateOnlineStatus();
		
		// Mettre à jour les statistiques
		const totalGames = (this.stats.pong_games || 0) + (this.stats.block_games || 0);
		this.gamePlayed.textContent = totalGames.toString();
		
		this.mmr.textContent = this.stats.mmr || '0';
		
		const totalWins = (this.stats.pong_wins || 0) + (this.stats.block_wins || 0);
		const winrateValue = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
		this.winrate.textContent = `${winrateValue}%`;
		
		this.rank.textContent = "1st";

		// Charger les parties récentes
		await this.loadRecentGames();

		// Vider la grille des amis
		this.friendsGrid.innerHTML = '';

		// Ajouter les amis
		if (this.friends && Array.isArray(this.friends)) {
			console.log(`👥 Ajout de ${this.friends.length} amis`);
			for (const friend of this.friends) {
				const tmp = {
					username: friend.user_1 !== this.user.username ? friend.user_1 : friend.user_2,
				};
				console.log("👤 Ajout ami:", tmp);
				this.friendsGrid.innerHTML += this.friendCard(tmp);
			}
		} else {
			console.log("👥 Aucun ami à afficher");
			this.friendsGrid.innerHTML = '<div class="no-friends">Aucun ami pour le moment</div>';
		}
	}

	private updateOnlineStatus() {
		// Pour l'instant, on suppose que l'utilisateur est en ligne
		// Dans une vraie application, on récupérerait cette info depuis une API
		const isOnline = this.user.online;
		
		if (isOnline) {
			this.online.textContent = 'En ligne';
			this.online.className = 'online-status';
			this.statusDot.className = 'status-dot online';
			// Mettre à jour le conteneur du statut
			const statusContainer = this.online.parentElement;
			if (statusContainer) {
				statusContainer.className = 'profile-status';
			}
		} else {
			this.online.textContent = 'Hors ligne';
			this.online.className = 'offline-status';
			this.statusDot.className = 'status-dot offline';
			// Mettre à jour le conteneur du statut
			const statusContainer = this.online.parentElement;
			if (statusContainer) {
				statusContainer.className = 'profile-status offline';
			}
		}
	}

	// Méthode pour tester différents statuts (à supprimer en production)
	public setOnlineStatus(isOnline: boolean) {
		if (isOnline) {
			this.online.textContent = 'En ligne';
			this.online.className = 'online-status';
			this.statusDot.className = 'status-dot online';
			// Mettre à jour le conteneur du statut
			const statusContainer = this.online.parentElement;
			if (statusContainer) {
				statusContainer.className = 'profile-status';
			}
		} else {
			this.online.textContent = 'Hors ligne';
			this.online.className = 'offline-status';
			this.statusDot.className = 'status-dot offline';
			// Mettre à jour le conteneur du statut
			const statusContainer = this.online.parentElement;
			if (statusContainer) {
				statusContainer.className = 'profile-status offline';
			}
		}
	}

	private async loadRecentGames() {
		try {
			console.log("🎮 Chargement des parties récentes pour:", this.user.username);
			this.recentGames = await getUserGameHistory(this.user.username);
			console.log("📊 Parties récupérées:", this.recentGames.length);
			console.log("🎮 Détail des parties:", this.recentGames);
			this.displayRecentGames();
		} catch (error) {
			console.error("❌ Erreur lors du chargement des parties récentes:", error);
			this.recentGames = [];
			this.displayRecentGames();
		}
	}

	private displayRecentGames() {
		if (!this.gameHistory) {
			console.error("❌ Element gameHistory non trouvé");
			return;
		}

		const formatDate = (timestamp: string | undefined) => {
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

		const gamesHtml = this.recentGames.length > 0 
			? this.recentGames.slice(0, 5).map((game, index) => {
				console.log(`🎮 Partie ${index + 1}:`, game);
				return `
				<div class="game-history-item">
					<div class="game-info">
						<div class="game-type">${getGameTypeLabel(game.game_type)}</div>
						<div class="game-players">
							<span class="player">${game.player1}</span>
							${game.player2 ? `<span class="vs">vs</span><span class="player">${game.player2}</span>` : ''}
							${game.player3 ? `<span class="vs">vs</span><span class="player">${game.player3}</span>` : ''}
							${game.player4 ? `<span class="vs">vs</span><span class="player">${game.player4}</span>` : ''}
						</div>
						<div class="game-result ${getGameResult(game, this.user.username).toLowerCase()}">
							${getGameResult(game, this.user.username)}
						</div>
					</div>
					<div class="game-date">
						${formatDate(game.end_time)}
					</div>
				</div>
			`}).join('')
			: '<div class="no-games">Aucune partie récente</div>';

		// Mettre à jour le contenu de la section gameHistory
		this.gameHistory.innerHTML = `
			<div class="section-header">
				<i class="fas fa-history"></i>
				<h2>Activité récente</h2>
			</div>
			<div class="recent-activity">
				${gamesHtml}
			</div>
		`;
	}

	private friendCard(friend: any) { // modifier status absent | en ligne avec redis
		return `
			<div class="friend-card">
				<div class="friend-avatar">${friend.username.charAt(0).toUpperCase()}</div>
				<div class="friend-name">${friend.username}</div>
				<div class="friend-status">Absent</div>
			</div>
			`;
        }

	private async addFriend() {

		if (this.relation) {

			const myState = this.relation.user_1 == this.me.username ? this.relation.user1_state : this.relation.user2_state;
			const userState = this.relation.user_1 == this.user.username ? this.relation.user1_state : this.relation.user2_state;

			// si on est amis on supprime la relation
			// si je lui avais envoyé une invite on supprime aussi
			if ((myState == 'normal' && userState == 'normal') || (myState == 'waiting' && userState == 'requested'))
				await this.deleteFriend();
			else if (myState == 'requested' && userState == 'waiting')
				await this.acceptFriend();
			// s'il m'avait demandé j'accept
		}
		else
			await this.createFriendRequest();
	}

	private async deleteFriend() {
		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Authentication token not found');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}

			await fetch(`/api/friend/${this.relation.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
			})
			this.addFriendBtn.textContent = 'Add Friend'
		}
		catch (err) {
			console.error(`error dans delete friend`)
		}
	}

	private async createFriendRequest() {
		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Authentication token not found');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}

			await fetch(`/api/friend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
				body: JSON.stringify({
					user_1: this.me.username,
					user_2: this.user.username,
					user1_state: 'waiting',
					user2_state: 'requested',
				})
			})
			this.addFriendBtn.textContent = 'requested'
		}
		catch (err) {
			console.error(`error dans add friend`)
		}
	}

	private async acceptFriend() {

		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Authentication token not found');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}

			await fetch(`/api/friend/${this.relation.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
			})
			this.addFriendBtn.textContent = 'remove friend'
		}
		catch (err) {
			console.error(`error dans add friend`)
		}
	}

	private async blockUser() {

		//reload la relation
		this.relation = await loadRelation(this.me.user, this.user.username);

		// si l'utilisateur était bloqueé mettre normal normal

		// sinon le bloquer mettre blocked et angry





	}


}