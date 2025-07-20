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

	private isMyFriend: boolean;

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
		setTimeout(() => {
			this.updateInfo();
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
			this.addFriendBtn.textContent = 'requested'
		})

		this.blockBtn.addEventListener('click', async () => {

			this.relation =  await loadRelation(this.me.username, this.user.username)
			await this.blockUser();

			if (this.blockBtn.textContent!.trim().includes('Bloquer'))
				this.blockBtn.innerHTML = '<i class="fas fa-check"></i> Débloquer';
			else
				this.blockBtn.innerHTML = '<i class="fas fa-ban"></i> Bloquer';
		})


	}

	private updateInfo() {
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

		// si c'est un ami --> supprimer l'ami
		// si c'est pas un ami --> ajouter l'ami
		// s'il est déjà demandé en ami --> cancel la request d'ami
		
		//pas possible de s'ajouter soit meme car pas possible d'arriver sur cette page, on redirige vers /me

		console.log(`🔍 Debug - addFriend called: ${this.me.username} wants to add ${this.user.username}`);

		// 2 - check si une relation n'existe pas déjà
		console.log(`dans le bueno ${this.relation}`);
		
	
		/// on fais vraiment la request
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
		}
		catch (err) {
			console.error(`nn nn c'est pas bon mgl`)
		}

	}

	private async blockUser() {

		//reload la relation
		this.relation = await loadRelation(this.me.user, this.user.username);

		// si l'utilisateur était bloqueé mettre normal normal

		// sinon le bloquer mettre blocked et angry





	}


	// // Gérer le clic sur un ami
        // private onFriendClick(friendName) {
        //     alert(`Interaction avec ${friendName}`);
        //     // Ici vous pouvez ajouter votre logique : ouvrir un chat, voir le profil, etc.
        // }

	// private async addFriend() {
	// 	const token = getAuthToken();
	// 	if (!token) {
	// 		alert('❌ Authentication token not found');
	// 		window.history.pushState({}, '', '/login');
	// 		window.dispatchEvent(new PopStateEvent('popstate'));
	// 		return;
	// 	}

	// 	await fetch(`/api/user/friend/?${this.user.id}`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'x-access-token': token,
	// 		},
	// 	})
	// 	.then(response => {
	// 		if (response.ok) {
	// 			alert('✅ Friend request sent!');
	// 			this.addFriendBtn.disabled = true;
	// 			this.addFriendBtn.innerText = 'Request Sent';
	// 		} else {
	// 			alert('❌ Error sending friend request');
	// 		}
	// 	})
	// 	.catch(err => {
	// 		console.error('Error sending friend request:', err);
	// 		alert('❌ Error sending friend request');
	// 	});
	// }

}