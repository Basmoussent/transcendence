import { getAuthToken } from '../../utils/auth';

export class profil {

	private me: any;
	private user: any;
	private stats: any;
	private friends: any;

	private homeBtn: HTMLElement;
	private username: HTMLElement;
	private addFriendBtn: HTMLElement;
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


		this.homeBtn = this.getElement('homeBtn');
		this.username = this.getElement('username');
		this.addFriendBtn = this.getElement('addFriend');
		this.gamePlayed = this.getElement('gamePlayed');
		this.winrate = this.getElement('winrate');
		this.mmr = this.getElement('mmr');
		this.rank = this.getElement('rank');
		this.gameHistory = this.getElement('gameHistory');
		this.friendsGrid = this.getElement('friends');

		this.setupEvents();

		this.updateInfo();
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


	}

	private updateInfo() {

		this.username.textContent = this.user.username;
		this.gamePlayed.textContent = this.stats.pong_games + this.stats.block_games;
		this.mmr.textContent = this.stats.mmr;
		this.winrate.textContent = this.stats.pong_games + this.stats.block_games ? `${(this.stats.pong_wins + this.stats.block_wins + this.stats.block_games) * 100}%` : 'N/A';
		this.rank.textContent = "rank tt le monde via mmr";

		// this.friendsGrid.textContent = '';


		for (const friend of this.friends) {
			const tmp = {
				username : friend.user_1 !== this.user.username ? friend.user_1: friend.user_2,
				
			}
			console.log(JSON.stringify(friend, null, 8))
			this.friendsGrid.innerHTML += this.friendCard(tmp);
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

		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Token d\'authentification manquant');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return null;
			}
	
			const response = await fetch(`/api/friend/${this.user.username}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
			});
		
			if (response.ok) {
				const result = await response.json();
				console.log("on a bien recup la game", result);
				const game: Game = {
					id: Number(result.id),
					uuid: sanitizeHtml(result.uuid),
					game_type: sanitizeHtml(result.game_type),
					player1: sanitizeHtml(result.player1),
					player2: sanitizeHtml(result?.player2),
					player3: sanitizeHtml(result?.player3),
					player4: sanitizeHtml(result?.player4),
					winner: sanitizeHtml(result?.winner),
					users_needed:(Number(result.users_needed)),
					start_time: sanitizeHtml(result?.start_time),
					end_time: sanitizeHtml(result?.end_time),
				};
				return game;
			}
			else 
				console.error("erreur specific getGame");

		}
		catch (err) {
			console.error(`nn nn c'est pas bon mgl`)
		}

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