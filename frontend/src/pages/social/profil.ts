import { getAuthToken } from '../../utils/auth';
import { addEvent } from '../../utils/eventManager';
import { t } from '../../utils/translations';

export class profil {

	private me: any;
	private user: any;
	private stats: any;
	private friends: any;
	private relation: any;

	private homeBtn: HTMLElement;
	private username: HTMLElement;
	private addFriendBtn: HTMLElement;
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
		this.gamePlayed = this.getElement('gamePlayed');
		this.winrate = this.getElement('winrate');
		this.mmr = this.getElement('mmr');
		this.rank = this.getElement('rank');
		this.gameHistory = this.getElement('gameHistory');
		this.friendsGrid = this.getElement('friends');


		// recup les relations de /me voir si ya user, 
		this.isMyFriend = false;


		// si this.me.username === this.user.username --> pas possible, on redirige vers /me

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

		addEvent(this.homeBtn, 'click', () => {
			window.history.pushState({}, '', '/main');
			window.dispatchEvent(new Event('popstate'));
		});

		addEvent(this.addFriendBtn, 'click', async () => {
			await this.addFriend();
			this.addFriendBtn.textContent = 'requested'

			//mmieux changer l'affichage

		})


	}

	private updateInfo() {

		this.username.textContent = this.user.username;
		this.gamePlayed.textContent = this.stats.pong_games + this.stats.block_games;
		this.mmr.textContent = this.stats.mmr;
		this.winrate.textContent = this.stats.pong_games + this.stats.block_games ? `${(this.stats.pong_wins + this.stats.block_wins + this.stats.block_games) * 100}%` : 'N/A';
		this.rank.textContent = "rank tt le monde via mmr";


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
		
		//pas possible de s'ajouter soit meme car pas possible d'arriver sur cette page, on redirige vers /me


		console.log(`🔍 Debug - addFriend called: ${user.username} wants to add ${friendName}`);

			
		// 2 - check si une relation n'existe pas déjà

		// via  this.relation
		
	/*
		/// on fais vraiment la request
		try {
			const token = getAuthToken();
			if (!token) {
				alert('❌ Token d\'authentification manquant');
				window.history.pushState({}, '', '/login');
				window.dispatchEvent(new PopStateEvent('popstate'));
				return null;
			}
	
			await fetch(`/api/friend/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-access-token': token,
				},
				body: JSON.stringify({
					user_1: this.me.username,
					user_2: this.user.username,
					user1_state: 'waiting',
					user2_state: 'requested'
				})
			});
		}
		catch (err) {
			console.error(`nn nn c'est pas bon mgl`)
		}
			*/

	}


	// // Gérer le clic sur un ami
        // private onFriendClick(friendName) {
        //     alert(`Interaction avec ${friendName}`);
        //     // Ici vous pouvez ajouter votre logique : ouvrir un chat, voir le profil, etc.
        // }

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
		const resultText = match.result === 'victory' ? t('social.victory') : match.result === 'defeat' ? t('social.defeat') : t('social.draw');
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
			return t('social.justNow');
		} else if (diffHours < 24) {
			return `${diffHours}h ago`;
		} else if (diffDays === 1) {
			return t('social.yesterday');
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