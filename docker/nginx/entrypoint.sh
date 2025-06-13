#!/bin/bash
set -ex

apt-get update && \
apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    lsb-release && \
    
apt-get install -y --no-install-recommends \
    nginx-common \
    libnginx-mod-http-ndk \
    modsecurity-crs \
    openssl && \

rm -rf /var/lib/apt/lists/* && \
echo ">>> [INFO] Installation terminée avec succès."

echo ">>> [INFO] Création du dossier de certificats SSL..."
mkdir -p /etc/nginx/ssl
chown -R nginx:nginx /etc/nginx/ssl
chmod 700 /etc/nginx/ssl

mkdir -p /var/log/modsecurity/audit/
chmod 700 /var/log/modsecurity/audit/


echo ">>> [INFO] Génération du certificat SSL auto-signé..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key-selfsigned.key \
    -out /etc/nginx/ssl/cert-selfsigned.crt \
    -subj "/C=FR/ST=North/L=Paris/O=Entropy/OU=Entropy/CN=entropy.local"


echo ">>> [INFO] Création du dossier de logs pour ModSecurity..."
mkdir -p /var/log/modsecurity
chown -R nginx:nginx /var/log/modsecurity

echo ">>> [INFO] Lancement de NGINX..."
exec nginx -g "daemon off;"
