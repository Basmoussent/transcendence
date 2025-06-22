#!/bin/bash

# Script pour générer les certificats SSL auto-signés pour les sous-domaines
# Nécessaire pour tester le système de cookies en HTTPS

echo "🔐 Génération des certificats SSL auto-signés"
echo "============================================"

# Variables
CERT_DIR="certs"
KEY_FILE="$CERT_DIR/key-selfsigned.key"
CERT_FILE="$CERT_DIR/cert-selfsigned.crt"
CONFIG_FILE="$CERT_DIR/openssl.conf"

# Créer le répertoire des certificats
mkdir -p "$CERT_DIR"

# Configuration OpenSSL pour les sous-domaines
cat > "$CONFIG_FILE" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = FR
ST = France
L = Paris
O = Transcendence
OU = Development
CN = *.localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.localhost
DNS.2 = localhost
DNS.3 = *.entropy.local
DNS.4 = entropy.local
DNS.5 = en.localhost
DNS.6 = fr.localhost
DNS.7 = es.localhost
DNS.8 = en.entropy.local
DNS.9 = fr.entropy.local
DNS.10 = es.entropy.local
EOF

echo "📝 Configuration OpenSSL créée"

# Générer la clé privée
echo "🔑 Génération de la clé privée..."
openssl genrsa -out "$KEY_FILE" 2048

if [ $? -eq 0 ]; then
    echo "✅ Clé privée générée: $KEY_FILE"
else
    echo "❌ Erreur lors de la génération de la clé privée"
    exit 1
fi

# Générer le certificat auto-signé
echo "📜 Génération du certificat auto-signé..."
openssl req -new -x509 -key "$KEY_FILE" -out "$CERT_FILE" -days 365 -config "$CONFIG_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Certificat généré: $CERT_FILE"
else
    echo "❌ Erreur lors de la génération du certificat"
    exit 1
fi

# Afficher les informations du certificat
echo ""
echo "📋 Informations du certificat:"
openssl x509 -in "$CERT_FILE" -text -noout | grep -E "(Subject:|DNS:|Not Before|Not After)"

# Instructions pour installer le certificat
echo ""
echo "📋 Instructions d'installation:"
echo "1. Ajoutez ces entrées dans votre fichier /etc/hosts:"
echo "   127.0.0.1 en.localhost"
echo "   127.0.0.1 fr.localhost"
echo "   127.0.0.1 es.localhost"
echo "   127.0.0.1 en.entropy.local"
echo "   127.0.0.1 fr.entropy.local"
echo "   127.0.0.1 es.entropy.local"
echo ""
echo "2. Pour Firefox, importez le certificat dans les paramètres de sécurité"
echo "3. Pour Chrome, acceptez le certificat lors de la première visite"
echo ""
echo "✅ Certificats générés avec succès !" 