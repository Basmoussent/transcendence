import { getAuthToken } from '../../utils/auth';

export class profil {

	private me: any;
	private user: any;
	private stats: any;
	private friends: any;

	private homeBtn: HTMLElement;
	private username: HTMLElement;
	private addFriendBtn: HTMLElement;
	private sendMsgBtn: HTMLElement;
	private gamePlayed: HTMLElement;
	private winrate: HTMLElement;
	private mmr: HTMLElement;
	private rank: HTMLElement;
	private gameHistory: HTMLElement;

	constructor (data: any) {

		this.me = data.me;
		this.user = data.user;
		this.stats = data.stats;
		this.friends = data.friends;


		this.homeBtn = this.getElement('homeBtn');
		this.username = this.getElement('username');
		this.addFriendBtn = this.getElement('addFriend');
		this.sendMsgBtn = this.getElement('sendMsg');
		this.gamePlayed = this.getElement('gamePlayed');
		this.winrate = this.getElement('winrate');
		this.mmr = this.getElement('mmr');
		this.rank = this.getElement('rank');
		this.gameHistory = this.getElement('gameHistory');

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

		this.addFriendBtn.addEventListener('click', () => {
			this.addFriend();
		})

		this.sendMsgBtn.addEventListener('click', () => {
			console.warn(`pas encore implémenté`)
		});


	}

	private updateInfo() {

		this.username.textContent = this.user.username;
		this.gamePlayed.textContent = this.stats.pong_games + this.stats.block_games;
		this.mmr.textContent = this.stats.mmr;
		this.winrate.textContent = this.stats.pong_games + this.stats.block_games ? `${(this.stats.pong_wins + this.stats.block_wins + this.stats.block_games) * 100}%` : 'N/A';
		this.rank.textContent = "rank tt le monde via mmr";


	}

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