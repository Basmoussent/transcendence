import { getAuthToken } from '../../utils/auth';
import { loadRelation } from './renderProfil'

export class profil {

	private me: any;
	private user: any;
	private stats: any;
	private friends: any;
	private relation: any;

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

	constructor (data: any) {

		this.me = data.me;
		this.user = data.user;
		this.stats = data.stats;
		this.friends = data.friends;
		this.relation = data.relation;


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

		this.relation = await loadRelation(this.me.username, this.user.username)

		const myState = this.relation.user_1 == this.me.username ? this.relation.user1_state : this.relation.user2_state;
		const userState = this.relation.user_1 == this.user.username ? this.relation.user1_state : this.relation.user2_state;

		// if myState == waiting --> cancel
		// if myState == requested --> accept friend request
		// if myState == normal --> remove friend

		// if userState == normal --> bloquer
		// if userState == blocked --> débloquer

		this.username.textContent = this.user.username || 'Utilisateur inconnu';
		
		// Mettre à jour les statistiques
		const totalGames = (this.stats.pong_games || 0) + (this.stats.block_games || 0);
		this.gamePlayed.textContent = totalGames.toString();
		
		this.mmr.textContent = this.stats.mmr || '0';
		
		const totalWins = (this.stats.pong_wins || 0) + (this.stats.block_wins || 0);
		const winrateValue = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
		this.winrate.textContent = `${winrateValue}%`;
		
		this.rank.textContent = "1st"; // TODO: Calculer le vrai rank

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