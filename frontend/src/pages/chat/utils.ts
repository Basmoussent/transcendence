import { Chat, UserChat } from './liveChat';
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

export async function fetchMe(): Promise<UserChat | void> {

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
				username: sanitizeHtml(result.user?.username),
				email: sanitizeHtml(result.user?.email),
				avatar_url: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				userId: Number(sanitizeHtml(result.user?.id)),
				receiver: 'null'
			};
			// console.log(`dans le bueno for real voici mes infos ${tmp.userId}, ${tmp.username}`)
			return (tmp);
		}
		else
			console.error('fetchMe failed');
	}
	catch (error) {
		console.error('fetchMe failed: ', error);
	}

}


export async function fetchUserInfo(userid: number): Promise<UserChat | void> {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return;
		}

		const response = await fetch(`/api/user/?userid=${userid}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			},
		});

		if (response.ok) {
			const result = await response.json();
			const tmp: UserChat = result.data;
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
	const me = await fetchMe();
	if (me) {
		chatInstance['me'] = me;
	}
}