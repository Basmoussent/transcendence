import requests
import subprocess
import time
import socket
import urllib3

# Désactive les warnings SSL (optionnel mais propre)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Boucle jusqu'à ce que le DNS 'vault' soit résolu
while True:
    try:
        socket.gethostbyname("vault")
        print("DNS OK: vault")
        break
    except socket.gaierror:
        print("DNS not ready for 'vault', waiting 1s")
        time.sleep(1)

# Boucle jusqu'à ce que Vault soit prêt
while True:
    try:
        response = requests.get("https://vault:8200/v1/sys/health", verify=False)
        if response.status_code == 200:
            print("Vault is ready")
            break
        print("Vault is not ready, waiting for 1 second")
    except Exception as e:
        print(f"Vault not reachable yet: {e}")
    time.sleep(1)

# Lance le backend Node.js
subprocess.run(["npm", "run", "dev"])
