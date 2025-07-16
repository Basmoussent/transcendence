// en suivant le format attendu par Google Authenticator
export function generateOtpAuthUrl(secret_key: string, email: string, issuer: string) {
	return `otpauth://totp/${issuer}:${email}?secret=${secret_key}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

