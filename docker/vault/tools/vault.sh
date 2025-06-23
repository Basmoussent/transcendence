#!/bin/sh

vault server -config=/vault/config.hcl &
VAULT_PID=$!

sleep 5

echo "🔐 Envoi de la requête d’unseal à Vault..."
curl --request POST \
  --header "Content-Type: application/json" \
  --data "{\"key\":\"$VAULT_KEY_1\"}" \
  "http://vault:8200/v1/sys/unseal"

echo "VAULT TOKEN =  == = = = == " $VAULT_TOKEN

curl --request POST \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --data '{"type":"kv","options":{"version":"2"}}' \
  http://vault:8200/v1/sys/mounts/secret

SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13)
echo "🔐 Ajout du secret JWT..."
curl --request POST \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --header "Content-Type: application/json" \
  --data "{\"data\":{\"JWT_KEY\":\"$SECRET\"}}" \
  http://vault:8200/v1/secret/data/JWT


wait $VAULT_PID
