import { getAuthToken } from '../../utils/auth';
import { loadRelation } from './renderProfil'
import { getUserGameHistory } from '../../game/gameUtils';

export class profil {

	private me: any;
	private user: any;
	private stats: any;
	private relation: any;
	private recentGames: any[];

	private homeBtn: HTMLElement;
	private username: HTMLElement;
	private avatar: HTMLImageElement;
	private addFriendBtn: HTMLButtonElement;
	private blockBtn: HTMLButtonElement;
	private gamePlayed: HTMLElement;
	private winrate: HTMLElement;
	private mmr: HTMLElement;
	private rank: HTMLElement;
	
	private gameHistory: HTMLElement;
	private online: HTMLElement;
	private statusDot: HTMLElement;

	// Stocker les références aux fonctions pour pouvoir les supprimer
	private boundAddFriendHandler: (() => Promise<void>) | null = null;
	private boundBlockHandler: (() => Promise<void>) | null = null;
	private boundHomeHandler: (() => void) | null = null;

	constructor (data: any) {
		console.log("profil constructor");

		this.me = data.me;
		this.user = data.user;
		this.stats = data.stats;
		this.relation = data.relation;
		this.recentGames = [];

		this.homeBtn = this.getElement('homeBtn');
		this.username = this.getElement('username');
		this.addFriendBtn = this.getElement('addFriend') as HTMLButtonElement;
		this.avatar = this.getElement('avatar') as HTMLImageElement;
		this.blockBtn = this.getElement('blockBtn') as HTMLButtonElement;
		this.gamePlayed = this.getElement('gamePlayed');
		this.winrate = this.getElement('winrate');
		this.mmr = this.getElement('mmr');
		this.rank = this.getElement('rank');
		this.gameHistory = this.getElement('gameHistory');
		this.online = this.getElement('online');
		this.statusDot = this.getElement('statusDot');

		// recup les relations de /me voir si ya user, 

		// si this.me.username === this.user.username --> pas possible, on redirige vers /me
		console.log("user ici lqlqlq qlqlq ", this.user)
		this.setupEvents();
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
		// Créer les fonctions liées pour pouvoir les supprimer plus tard
		this.boundHomeHandler = () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new Event('popstate'));
		};

		this.boundAddFriendHandler = async () => {
			await this.addFriend();
			await this.updateInfo();
		};

		this.boundBlockHandler = async () => {
			await this.handleBlock();
			await this.updateInfo();
		};

		// Supprimer les anciens événements s'ils existent
		if (this.boundHomeHandler) {
			this.homeBtn.removeEventListener('click', this.boundHomeHandler);
		}
		if (this.boundAddFriendHandler) {
			this.addFriendBtn.removeEventListener('click', this.boundAddFriendHandler);
		}
		if (this.boundBlockHandler) {
			this.blockBtn.removeEventListener('click', this.boundBlockHandler);
		}

		// Ajouter les nouveaux événements
		this.homeBtn.addEventListener('click', this.boundHomeHandler);
		this.addFriendBtn.addEventListener('click', this.boundAddFriendHandler);
		console.log("addFriendBtn added");
		this.blockBtn.addEventListener('click', this.boundBlockHandler);
	}

	// Méthode pour nettoyer les événements (appelée lors de la destruction)
	public cleanup() {
		if (this.boundHomeHandler) {
			this.homeBtn.removeEventListener('click', this.boundHomeHandler);
		}
		if (this.boundAddFriendHandler) {
			this.addFriendBtn.removeEventListener('click', this.boundAddFriendHandler);
		}
		if (this.boundBlockHandler) {
			this.blockBtn.removeEventListener('click', this.boundBlockHandler);
		}
	}

	///TODO changer pour regarder par rapport aux id
	private async updateInfo() {
		// console.log("🔍 updateInfo - stats:", this.stats);
		// console.log("🔍 updateInfo - user:", this.user);

		console.log("on update les infos")

		if (!this.username || !this.gamePlayed || !this.mmr || !this.winrate || !this.rank || !this.gameHistory || !this.online || !this.statusDot)
			console.error("❌ il manque un element");

		// Recharger la relation depuis la DB
		this.relation = await loadRelation(this.me.id, this.user.id)

		// Mettre à jour les boutons selon la relation
		this.updateButtons();

		this.username.textContent = this.user.username;
		this.avatar.src = "/api/uploads/" + this.user.avatar || '../../public/avatar2.png';
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

	}

	private updateButtons() {
		// Réinitialiser les classes et états des boutons
		this.addFriendBtn.classList.remove('hidden');
		this.blockBtn.classList.remove('hidden');

		this.addFriendBtn.disabled = false;

		if (this.relation) {
			const myState = this.relation.user_1 == this.me.id ? this.relation.user1_state : this.relation.user2_state;
			const userState = this.relation.user_1 == this.user.id ? this.relation.user1_state : this.relation.user2_state;

			console.log(`🔍 Relation trouvée - Mon état: ${myState}, État utilisateur: ${userState}`);

			// Gestion du bouton Add Friend
			if (myState === 'waiting') {
				this.addFriendBtn.textContent = 'Annuler la demande';
			} else if (myState === 'requested') {
				this.addFriendBtn.textContent = 'Accepter la demande';
			} else if (myState === 'normal' && userState === 'normal') {
				this.addFriendBtn.textContent = 'Retirer des amis';
			} else if (myState === 'angry' || userState === 'blocked') {
				this.addFriendBtn.textContent = 'Utilisateur bloqué';
				this.addFriendBtn.disabled = true;
			}

			// Gestion du bouton Block
			if (myState === 'angry') {
				this.blockBtn.textContent = 'Débloquer';
			} else if (userState === 'blocked') {
				this.blockBtn.textContent = 'Utilisateur bloqué';
				this.blockBtn.classList.add('disabled');
			} else {
				this.blockBtn.textContent = 'Bloquer';
			}
		} else {
			// Aucune relation existante
			this.addFriendBtn.textContent = 'Ajouter en ami';
			this.blockBtn.textContent = 'Bloquer';
		}
	}

	private updateOnlineStatus() {
		// Pour l'instant, on suppose que l'utilisateur est en ligne
		// Dans une vraie application, on récupérerait cette info depuis une API
		const isOnline = this.user.online;
		console.log("online stqtus ", this.user)
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

			const myState = this.relation.user_1 == this.me.id ? this.relation.user1_state : this.relation.user2_state;
			const userState = this.relation.user_1 == this.user.id ? this.relation.user1_state : this.relation.user2_state;

			if ((myState == 'normal' && userState == 'normal') || (myState == 'waiting' && userState == 'requested')) {
				console.log("je passe ici ")
				await this.deleteRelation();
			}
			else if (myState == 'requested' && userState == 'waiting')
				await this.acceptFriend();
		}
		else
			await this.createFriendRequest();
	}

	private async deleteRelation() {
		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Authentication token not found');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}

			const response = await fetch(`/api/friend/${this.relation.id}`, {
				method: 'POST',
				headers: {
					'x-access-token': token,
				},
			});

			if (response.ok) {
				console.log('✅ Relation supprimée avec succès');
				this.relation = null; // Réinitialiser la relation
			} else {
				console.error('❌ Erreur lors de la suppression de la relation');
			}
		}
		catch (err) {
			console.error(`❌ Erreur dans deleteRelation:`, err);
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

			const response = await fetch(`/api/friend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
				body: JSON.stringify({
					user_1: this.me.id,
					user_2: this.user.id,
					user1_state: 'waiting',
					user2_state: 'requested',
				})
			});

		}
		catch (err) {
			console.error(`❌ Erreur dans createFriendRequest:`, err);
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

			await fetch(`/api/friend/accept/${this.relation.id}`, {
				method: 'POST',
				headers: {
					'x-access-token': token,
				},
			});

		}
		catch (err) {
			console.error(`❌ Erreur dans acceptFriend:`, err);
		}
	}

	private async handleBlock() {
		if (this.relation) {
			const myState = this.relation.user_1 == this.me.id ? this.relation.user1_state : this.relation.user2_state;
			const userState = this.relation.user_1 == this.user.id ? this.relation.user1_state : this.relation.user2_state;

			console.log(`🔍 handleBlock - Mon état: ${myState}, État utilisateur: ${userState}`);

			if (myState === 'angry' && userState === 'blocked') {
				// Débloquer l'utilisateur
				await this.deleteRelation();
			} else {
				// Bloquer l'utilisateur
				const whichuser = this.relation.user_1 == this.user.id ? 'user1_state': 'user2_state';
				await this.changeRelationToBlocked(whichuser);
			}
		} else {
			// Créer une nouvelle relation avec blocage
			await this.blockUser(this.me.id, this.user.id);
		}
	}

	private async changeRelationToBlocked(state: string) {
		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Authentication token not found');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}

			await fetch(`/api/friend/block/?relationid=${this.relation.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
				body: JSON.stringify({
					userState: state
				})
			});
		}
		catch (err) {
			console.error(`❌ Erreur dans changeRelationToBlocked:`, err);
		}
	}

	private async blockUser(angry: number, blocked: number) {
		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Authentication token not found');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return;
			}

			await fetch(`/api/friend/blockUser?angry=${angry}&blocked=${blocked}`, {
				method: 'POST',
				headers: {
					'x-access-token': token
				},
			});

		}
		catch (err) {
			console.error(`❌ Erreur dans blockUser:`, err);
		}
	}
}