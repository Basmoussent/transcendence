FROM alpine:latest

# Installer les dépendances nécessaires
RUN apk add --no-cache curl unzip bash jq

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

# Copier la config Vault et le script de démarrage
COPY config.hcl /vault/config.hcl
COPY tools/vault.sh /vault.sh

# Rendre le script exécutable
RUN chmod +x /vault.sh

# Définir le point d'entrée
ENTRYPOINT [ "sh", "/vault.sh" ]
