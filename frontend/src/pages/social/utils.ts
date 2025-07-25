import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';

interface UserData {
	id: number;
	username: string;
	email: string;
	avatar_url?: string;
	two_fact_auth: boolean;
}

export async function fetchMe(): Promise<UserData | void> {

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
			const tmp: UserData = {
				username: sanitizeHtml(result.user?.username),
				email: sanitizeHtml(result.user?.email),
				avatar_url: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				id: Number(sanitizeHtml(result.user?.id)),
				two_fact_auth: Boolean(sanitizeHtml(result.user?.two_fact_auth)) || false,
			};
			return (tmp);
		}
		else
			console.error('fetchMe failed');
	}
	catch (error) {
		console.error('fetchMe failed: ', error);
	}
}

export async function fetchMe2fa(): Promise<UserData | void> {

	try {
		const token = getAuthToken();
		if (!token) {
			alert('❌ Token d\'authentification manquant');
			window.history.pushState({}, '', '/login');
			window.dispatchEvent(new PopStateEvent('popstate'));
			return;
		}

		const response = await fetch('/api/me2fa', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': token
			}
		});

		if (response.ok) {
			const result = await response.json();
			const tmp: UserData = {
				username: sanitizeHtml(result.user?.username),
				email: sanitizeHtml(result.user?.email),
				avatar_url: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				id: Number(sanitizeHtml(result.user?.id)),
				two_fact_auth: Boolean(sanitizeHtml(result.user?.two_fact_auth)) || false,
			};
			return (tmp);
		}
		else
			console.error('fetchMe failed');
	}
	catch (error) {
		console.error('fetchMe failed: ', error);
	}
}

export async function userInfo() {
	const token = getAuthToken();
	if (!token) {
		alert('❌ Token d\'authentification manquant');
		window.history.pushState({}, '', '/login');
		window.dispatchEvent(new PopStateEvent('popstate'));
		return;
	}

	try {
		const response = await fetch('/api/me', {
			method: 'GET',
			headers: {
				'x-access-token': token,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok)
			throw new Error();

		const data = await response.json();
		return data;
	}
	catch (error) {
		console.error('userInfo failed: ', error);
		return false; // en cas d'erreur, suppose désactivé
	}
}

export async function update2FAState(status: number, userId: number): Promise<boolean> {
	const token = getAuthToken();
	if (!token) {
		alert('❌ Token d\'authentification manquant');
		window.history.pushState({}, '', '/login');
		window.dispatchEvent(new PopStateEvent('popstate'));
		return false;
	}

	try {
		const response = await fetch('/api/username/2fa', {
			method: 'POST',
			headers: {
				'x-access-token': token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				status: status,
				userId: userId
			})
		});

		const data = await response.json();

		if (!response.ok)
			throw new Error('Échec de la requête PUT /2fa');

        if (data.success)
            return true;
        else
            		throw new Error(data.error || 'Échec de la mise à jour du statut 2FA');
    } catch (error) {
		console.error('reverse2FAstatus failed: ', error);
		return false;
	}
}
