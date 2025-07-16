// secret unique a chaque user, faudra stocker dans la bdd a l'activation de la 2fa
export function generateBase32Key(length: number = 32): string {
	const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	let key = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * base32Chars.length);
		key += base32Chars[randomIndex];
	}

	return key;
}
