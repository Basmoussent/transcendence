#!/usr/bin/env python3

import requests
import json
import time
import subprocess
import sys
import os
import signal
from typing import Optional, Dict, Any

def load_env_file(path):
    try:
        with open(path) as f:
            for line in f:
                if line.strip() == '' or line.startswith('#'):
                    continue
                key, value = line.strip().split('=', 1)
                os.environ[key] = value
    except FileNotFoundError:
        print(f"Environment file {path} not found, continuing without it.")
load_env_file('/tmp/vault.env')

class VaultManager:
    def __init__(self, vault_url: str = "http://vault:8200"):
        self.vault_url = vault_url
        self.session = requests.Session()
        self.vault_process = None
        
    def start_vault_server(self):
        """Start Vault server in background"""
        print("Starting Vault server...")
        try:
            self.vault_process = subprocess.Popen([
                "vault", "server", "-config=/vault/config/config.hcl"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print(f"Vault server started with PID: {self.vault_process.pid}")
            return True
        except Exception as e:
            print(f"Failed to start Vault server: {e}")
            return False
        
    def stop_vault_server(self):
        """Stop Vault server gracefully"""
        if self.vault_process:
            print("Stopping Vault server...")
            self.vault_process.terminate()
            try:
                self.vault_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.vault_process.kill()
            print("Vault server stopped")
        
    def is_vault_running(self) -> bool:
        """Check if Vault is running and responding"""
        try:
            response = self.session.get(f"{self.vault_url}/v1/sys/health", timeout=5)
            return response.status_code in [200, 501, 503]
        except requests.exceptions.RequestException:
            return False
    
    def is_vault_initialized(self) -> bool:
        """Check if Vault is already initialized"""
        try:
            response = self.session.get(f"{self.vault_url}/v1/sys/init")
            if response.status_code == 200:
                data = response.json()
                return data.get('initialized', False)
            return False
        except requests.exceptions.RequestException:
            return False
    
    def is_vault_sealed(self) -> bool:
        """Check if Vault is sealed"""
        try:
            response = self.session.get(f"{self.vault_url}/v1/sys/seal-status")
            if response.status_code == 200:
                data = response.json()
                return data.get('sealed', True)
            return True
        except requests.exceptions.RequestException:
            return True
    
    def initialize_vault(self) -> Optional[Dict[str, Any]]:
        print("Initialisation de Vault...")
        try:
            response = self.session.post(
                f"{self.vault_url}/v1/sys/init",
                json={"secret_shares": 1, "secret_threshold": 1},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de l'initialisation: {e}")
            return None
    
    def unseal_vault(self, key: str) -> bool:
        """Unseal Vault with the provided key"""
        print("Envoi de la requête d'unseal à Vault...")
        try:
            response = self.session.post(
                f"{self.vault_url}/v1/sys/unseal",
                json={"key": key},
                timeout=30
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de l'unseal: {e}")
            return False
    
    def mount_kv_secrets_engine(self, token: str) -> bool:
        """Mount the KV secrets engine"""
        try:
            response = self.session.post(
                f"{self.vault_url}/v1/sys/mounts/secret",
                headers={"X-Vault-Token": token},
                json={"type": "kv", "options": {"version": "2"}},
                timeout=30
            )
            return response.status_code in [200, 204, 400]
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors du montage du secrets engine: {e}")
            return False
    
    def store_jwt_secret(self, token: str, jwt_key: str) -> bool:
        """Store JWT secret in Vault"""
        print("Ajout du secret JWT...")
        try:
            response = self.session.post(
                f"{self.vault_url}/v1/secret/data/JWT",
                headers={"X-Vault-Token": token},
                json={"data": {"JWT_KEY": jwt_key}},
                timeout=30
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors du stockage du secret JWT: {e}")
            return False
    
    def store_key_secret(self, token: str, jwt_key: str) -> bool:
        """Store KEY_SECRET secret in Vault"""
        print("Ajout du secret KEY_SECRET...")
        try:
            response = self.session.post(
                f"{self.vault_url}/v1/secret/data/KEY",
                headers={"X-Vault-Token": token},
                json={"data": {"KEY_SECRET": jwt_key}},
                timeout=30
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors du stockage du secret JWT: {e}")
            return False
    
    def generate_random_secret(self, length: int = 24) -> str:
        """Generate a random secret string"""
        import secrets
        import string
        import dotenv
        try :
            dotenv.load_dotenv("/tmp/vault.env")
            JWT = os.getenv('VAULT_JWT_KEY')
            if JWT:
                print("Utilisation du secret JWT existant :", JWT)
                return JWT
            else:
                alphabet = string.ascii_letters + string.digits
                return ''.join(secrets.choice(alphabet) for _ in range(length))
        except:
            print("Erreur lors de la génération du secret aléatoire")
            sys.exit(1)

    def generate_random_secret_2fa(self, length: int = 24) -> str:
        """Generate a random secret string"""
        import secrets
        import string
        import dotenv
        try :
            dotenv.load_dotenv("/tmp/vault.env")
            KEY = os.getenv('KEY_SECRET')
            if KEY:
                print("Utilisation du secret KEY_SECRET existant :", KEY)
                return KEY
            else:
                alphabet = string.ascii_letters + string.digits
                return ''.join(secrets.choice(alphabet) for _ in range(length))
        except:
            print("Erreur lors de la génération du secret aléatoire")
            sys.exit(1)
        

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("\nReceived shutdown signal, cleaning up...")
    if vault_manager:
        vault_manager.stop_vault_server()
    sys.exit(0)

def main():
    global vault_manager
    vault_manager = VaultManager()
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    if not vault_manager.start_vault_server():
        print("Failed to start Vault server")
        sys.exit(1)
    
    print("Attente du démarrage de Vault...")
    max_retries = 30
    for i in range(max_retries):
        if vault_manager.is_vault_running():
            print("Vault est en cours d'exécution")
            break
        if i == max_retries - 1:
            print("Vault n'a pas démarré dans le délai imparti")
            vault_manager.stop_vault_server()
            sys.exit(1)
        time.sleep(1)
    
    if vault_manager.is_vault_initialized():
        print("Vault est déjà initialisé")
        vault_key = os.getenv('VAULT_KEY_1')
        vault_token = os.getenv('VAULT_TOKEN')
        if not vault_manager.unseal_vault(vault_key):
            print("Échec de l'unseal de Vault")
            vault_manager.stop_vault_server()
            sys.exit(1)
        
        if not vault_manager.mount_kv_secrets_engine(vault_token):
            print("Échec du montage du secrets engine")
            vault_manager.stop_vault_server()
            sys.exit(1)
        
        jwt_secret = vault_manager.generate_random_secret()
        if not vault_manager.store_jwt_secret(vault_token, jwt_secret):
            print("Échec du stockage du secret JWT")
            vault_manager.stop_vault_server()
            sys.exit(1)
        key_secret = vault_manager.generate_random_secret_2fa()
        if not vault_manager.store_key_secret(vault_token, key_secret):
            print("Échec du stockage du secret JWT")
            vault_manager.stop_vault_server()
            sys.exit(1)

        env_content = f"""VAULT_KEY_1={vault_key}
VAULT_TOKEN={vault_token}
KEY_SECRET={key_secret}
VAULT_JWT_KEY={jwt_secret}"""
        print("Configuration de Vault terminée avec succès")
        try:
            with open('/tmp/vault.env', 'w') as f:
                f.write(env_content)
            print("Variables d'environnement sauvegardées dans /tmp/vault.env")
        except Exception as e:
            print(f"Impossible de sauvegarder les variables d'environnement: {e}")

    else:
        print("Vault n'est pas initialisé, initialisation en cours...")
        
        init_result = vault_manager.initialize_vault()
        if not init_result:
            print("Échec de l'initialisation de Vault")
            vault_manager.stop_vault_server()
            sys.exit(1)
        
        vault_key = init_result['keys'][0]
        vault_token = init_result['root_token']
        
        if not vault_manager.unseal_vault(vault_key):
            print("Échec de l'unseal de Vault")
            vault_manager.stop_vault_server()
            sys.exit(1)
        
        if not vault_manager.mount_kv_secrets_engine(vault_token):
            print("Échec du montage du secrets engine")
            vault_manager.stop_vault_server()
            sys.exit(1)
        
        jwt_secret = vault_manager.generate_random_secret()
        if not vault_manager.store_jwt_secret(vault_token, jwt_secret):
            print("Échec du stockage du secret JWT")
            vault_manager.stop_vault_server()
            sys.exit(1)

        key_secret = vault_manager.generate_random_secret_2fa()
        if not vault_manager.store_key_secret(vault_token, key_secret):
            print("Échec du stockage du secret JWT")
            vault_manager.stop_vault_server()
            sys.exit(1)
        
        print("Configuration de Vault terminée avec succès")
        env_content = f"""VAULT_KEY_1={vault_key}
VAULT_TOKEN={vault_token}
KEY_SECRET={key_secret}
VAULT_JWT_KEY={jwt_secret}
"""
        try:
            with open('/tmp/vault.env', 'w') as f:
                f.write(env_content)
            print("Variables d'environnement sauvegardées dans /tmp/vault.env")
        except Exception as e:
            print(f"Impossible de sauvegarder les variables d'environnement: {e}")

    try:
        vault_manager.vault_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        vault_manager.stop_vault_server()

if __name__ == "__main__":
    main() 