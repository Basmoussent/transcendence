import { getAuthToken } from '../../utils/auth';

export class profil {

	private me: any;
	private user: any;
	private stats: any;

	private homeBtn: HTMLElement;
	private username: HTMLElement;
	private addFriendBtn: HTMLElement;
	private sendMsgBtn: HTMLElement;
	private gamePlayed: HTMLElement;
	private winrate: HTMLElement;
	private victory: HTMLElement;
	private rank: HTMLElement;
	private gameHistory: HTMLElement;

	constructor (me: any, user: any, stats: any) {

		this.me = me;
		this.user = user;
		this.stats = stats;

		this.homeBtn = this.getElement('homeBtn');
		this.username = this.getElement('username');
		this.addFriendBtn = this.getElement('addFriend');
		this.sendMsgBtn = this.getElement('sendMsg');
		this.gamePlayed = this.getElement('gamePlayed');
		this.winrate = this.getElement('winrate');
		this.victory = this.getElement('victory');
		this.rank = this.getElement('rank');
		this.gameHistory = this.getElement('gameHistory');

		this.setupEvents();

		this.updateInfo();
		this.loadMatchHistory();
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

		this.username.innerHTML = this.user.username;
		this.gamePlayed.innerHTML = this.stats.gamePlayed;
		this.victory.innerHTML = this.stats.victory;
		this.winrate.innerHTML = `${(this.stats.victory / this.stats.gamePlayed) * 100}%`;
		this.rank.innerHTML = this.stats.rank;
	}

	private loadMatchHistory() {
		// Données factices pour l'historique des parties
		const fakeHistory = [
			{
				gameType: 'pong',
				result: 'victory',
				opponent: 'Player123',
				score: '11-8',
				date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 heures ago
			},
			{
				gameType: 'block',
				result: 'defeat',
				opponent: 'GamerPro',
				score: '5-11',
				date: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 heures ago
			},
			{
				gameType: 'pong',
				result: 'victory',
				opponent: 'Newbie99',
				score: '11-3',
				date: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 heures ago
			},
			{
				gameType: 'block',
				result: 'draw',
				opponent: 'EqualPlayer',
				score: '10-10',
				date: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 heures ago
			},
			{
				gameType: 'pong',
				result: 'defeat',
				opponent: 'Champion2024',
				score: '7-11',
				date: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 heures ago
			},
			{
				gameType: 'block',
				result: 'victory',
				opponent: 'BlockMaster',
				score: '11-6',
				date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 jour ago
			},
			{
				gameType: 'pong',
				result: 'victory',
				opponent: 'PongKing',
				score: '11-9',
				date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 jours ago
			},
			{
				gameType: 'block',
				result: 'defeat',
				opponent: 'CubeDestroyer',
				score: '4-11',
				date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 jours ago
			},
			{
				gameType: 'pong',
				result: 'victory',
				opponent: 'SpeedDemon',
				score: '11-7',
				date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 jours ago
			},
			{
				gameType: 'block',
				result: 'victory',
				opponent: 'BlockNinja',
				score: '11-5',
				date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 jours ago
			}
		];

		const matchHistoryList = document.getElementById('match-history-list');
		if (matchHistoryList) {
			matchHistoryList.innerHTML = fakeHistory.map(match => this.createMatchItem(match)).join('');
		}
	}

	private createMatchItem(match: any): string {
		const gameIcon = match.gameType === 'pong' ? 'fa-table-tennis' : 'fa-cubes';
		const gameTypeClass = match.gameType === 'pong' ? 'pong' : 'block';
		const resultText = match.result === 'victory' ? 'Victory' : match.result === 'defeat' ? 'Defeat' : 'Draw';
		const dateText = this.formatDate(match.date);

		return `
			<div class="match-item ${match.result}">
				<div class="match-icon ${gameTypeClass}">
					<i class="fas ${gameIcon}"></i>
				</div>
				<div class="match-content">
					<div class="match-result">${resultText}</div>
					<div class="match-details">
						<span class="match-opponent">vs ${match.opponent}</span>
						<span class="match-score">${match.score}</span>
					</div>
				</div>
				<div class="match-date">${dateText}</div>
			</div>
		`;
	}

	private formatDate(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);

		if (diffHours < 1) {
			return 'Just now';
		} else if (diffHours < 24) {
			return `${diffHours}h ago`;
		} else if (diffDays === 1) {
			return 'Yesterday';
		} else {
			return `${diffDays}d ago`;
		}
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