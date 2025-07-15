import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

interface UserData {
	id: number;
	username: string;
	email: string;
	avatar_url?: string;
	two_fact_auth: boolean;
	secret_key: string;
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
				username: sanitizeHtml(result.user?.username) || 'Username',
				email: sanitizeHtml(result.user?.email) || 'email@example.com',
				avatar_url: sanitizeHtml(result.user?.avatar_url) || 'avatar.png',
				id: Number(sanitizeHtml(result.user?.id)) || 0,
				two_fact_auth: Boolean(sanitizeHtml(result.user?.two_fact_auth)) || false,
				secret_key: sanitizeHtml(result.user?.secret_key)
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
    if (!token)
        return false;

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
    } catch {
        return false; // en cas d'erreur, suppose désactivé
    }
}

export async function reverse2FAState(status: boolean, userId: number) {
    const token = getAuthToken();
    if (!token)
        return false;

    try {
        const response = await fetch('/api/username/2fa', {
            method: 'PUT',
            headers: {
                'x-access-token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                userId: userId
            })
        });

        if (!response.ok)
            throw new Error();

        const data = await response.json();
        data.two_fact_auth = !data.two_fact_auth;
    } catch {
    }
}