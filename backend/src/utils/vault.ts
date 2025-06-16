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
  const vaultUrl = process.env.VAULT_ADDR || 'http://vault:8200';

  // Attente que Vault soit unsealed
  while (true) {
    try {
      const healthResp = await fetch(`${vaultUrl}/v1/sys/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!healthResp.ok) {
        console.log(`Waiting for Vault... status: ${healthResp.status}`);
      } else {
        const healthData = await healthResp.json();
        if (healthData.sealed === false) {
          console.log('Vault is unsealed and ready.');
          break;
        } else {
          console.log('Vault is sealed, waiting...');
        }
      }
    } catch (error) {
      console.log('Error checking Vault health, retrying...', error);
    }

    await new Promise((res) => setTimeout(res, 1000));
  }

  // Continue la récupération du secret
  try {
    const token = process.env.VAULT_TOKEN;
    
    if (!token) {
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

    if (!response.ok) {
      throw new Error(`Vault API request failed(${url}): ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as VaultResponse;

    if (!data?.data?.data || !(key in data.data.data)) {
      throw new Error(`Key "${key}" not found at path "${secretPath}"`);
    }

    return data.data.data[key];
  } catch (error) {
    console.error('❌ Failed to fetch secret from Vault:', error);
    throw error;
  }
}