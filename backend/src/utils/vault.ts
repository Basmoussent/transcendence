import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const fileToCheck = '/tmp/vault.env';

function waitForFileAndExecute(callback: (envPath: string) => void): void {
	const interval = setInterval(() => {
		if (fs.existsSync(fileToCheck)) {
			clearInterval(interval);
			const envPath = path.resolve(fileToCheck);
			callback(envPath);
		}
	}, 1000);
}

waitForFileAndExecute((envPath: string) => {
		dotenv.config({ path: envPath });
});

interface VaultResponse {
	data: {
		data: Record<string, any>;
		metadata?: any;
	};
}

export async function getSecretFromVault(
	secretPath: string,
	key: string,
	mountPoint = 'secret'
): Promise<string> {
	const vaultUrl = process.env.VAULT_ADDR || 'https://vault:8200';
	console.log("vaultUrl", vaultUrl);
	// Attente que Vault soit unsealed
	// Recharger les variables d'environnement depuis le fichier vault.env
	if (fs.existsSync(fileToCheck))
		dotenv.config({ path: fileToCheck });

	// Continue la récupération du secret
	try {
		const token = process.env.VAULT_TOKEN;
		if (!token) {
			console.log('❌ VAULT_TOKEN not found in environment variables');
			console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('VAULT')));
			throw new Error('VAULT_TOKEN environment variable is required');
		}
		
		const url = `${vaultUrl}/v1/${mountPoint}/data/${secretPath}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'X-Vault-Token': token,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok)
			throw new Error(`Vault API request failed(${url}): ${response.status} ${response.statusText}`);

		const data = await response.json() as VaultResponse;

		if (!data?.data?.data || !(key in data.data.data))
			throw new Error(`Key "${key}" not found at path "${secretPath}"`);

		return data.data.data[key];
	}
	catch (error) {
		console.error('❌ Failed to fetch secret from Vault:', error);
		throw error;
	}
}