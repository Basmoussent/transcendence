import { Chat, UserChat } from './liveChat';
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

export async function fetchUserInfo(): Promise<UserChat | void> {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return;
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
			const tmp: UserChat = {
				username: sanitizeHtml(result.user?.username) || 'Username',
				email: sanitizeHtml(result.user?.email) || 'email@example.com',
				avatar_url: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				userId: Number(sanitizeHtml(result.user?.id)) || 0,
				receiver: 'null'

			};
			// console.log(`dans le bueno for real voici mes infos ${tmp.userId}, ${tmp.username}`)
			return (tmp);
		}
		else
			console.error('fetchuserinfo failed');
	}
	catch (error) {
		console.error('fetchuserinfo failed: ', error);
	}

}

export async function loadMe(chatInstance: Chat) {
	const me = await fetchUserInfo();
	if (me) {
		chatInstance['me'] = me;
	}
}