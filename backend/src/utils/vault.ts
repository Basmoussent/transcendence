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
  try {
    const vaultUrl = process.env.VAULT_ADDR || 'http://vault:8200';
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
      throw new Error(`Vault API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as VaultResponse;
    console.log('Vault response:', JSON.stringify(data, null, 2));

    if (!data?.data?.data || !(key in data.data.data)) {
      throw new Error(`Key "${key}" not found at path "${secretPath}"`);
    }

    return data.data.data[key];
  } catch (error) {
    console.error('❌ Failed to fetch secret from Vault:', error);
    throw error;
  }
}