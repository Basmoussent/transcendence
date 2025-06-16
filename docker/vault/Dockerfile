FROM alpine:latest

# Installer les dépendances nécessaires
RUN apk add --no-cache curl unzip

# Télécharger et installer Vault
RUN curl -L https://releases.hashicorp.com/vault/1.15.2/vault_1.15.2_linux_amd64.zip -o vault.zip && \
    unzip vault.zip && \
    mv vault /usr/local/bin/ && \
    rm vault.zip

# Créer le répertoire pour les données Vault
RUN mkdir -p /vault/data

# Exposer le port 8200
EXPOSE 8200

# Définir les variables d'environnement
ENV VAULT_ADDR=http://vault:8200


COPY config.hcl /vault/config.hcl
# Définir la commande par défaut
RUN vault server -config=/vault/config.hcl
COPY tools/vault.sh /vault.sh
RUN chmod +x /vault.sh
ENTRYPOINT [ "sh","/vault.sh" ]