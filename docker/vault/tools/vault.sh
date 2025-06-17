#!/bin/sh

# Démarre Vault en arrière-plan
vault server -config=/vault/config.hcl &
VAULT_PID=$!

# Attend quelques secondes pour laisser Vault démarrer
sleep 5

# Envoie la requête d’unseal
echo "🔐 Envoi de la requête d’unseal à Vault..."
curl --request POST \
  --header "Content-Type: application/json" \
  --data "{\"key\":\"$VAULT_KEY_1\"}" \
  "http://vault:8200/v1/sys/unseal"

echo "✅ Unseal terminé (ou partiel si threshold > 1)"

# Active le moteur de secrets KV à l'adresse secret/ (si ce n'est pas déjà fait)
echo "🔧 Activation du moteur de secrets KV (v2) à l'emplacement 'secret/'..."
curl --request POST \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --data '{"type":"kv","options":{"version":"2"}}' \
  http://vault:8200/v1/sys/mounts/secret

# Ajoute le secret JWT avec la clé JWT_KEY et la valeur supersecret
SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13)
echo "🔐 Ajout du secret JWT..."
curl --request POST \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --header "Content-Type: application/json" \
  --data "{\"data\":{\"JWT_KEY\":\"$SECRET\"}}" \
  http://vault:8200/v1/secret/data/JWT


wait $VAULT_PID
