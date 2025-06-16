#!/bin/sh


# Charge les variables d'environnement depuis .env

# Vérifie que la clé est bien définie
# Adresse de Vault

vault server -config=/vault/config.hcl &
VAULT_PID=$!
echo $VAULT_KEY_1

sleep 5
# Envoie la requête d’unseal
echo "🔐 Envoi de la requête d’unseal à Vault..."
curl --request POST \
  --header "Content-Type: application/json" \
  --data "{\"key\":\"$VAULT_KEY_1\"}" \
  "http://vault:8200/v1/sys/unseal"

echo "✅ Unseal terminé (ou partiel si threshold > 1)"

wait $VAULT_PID