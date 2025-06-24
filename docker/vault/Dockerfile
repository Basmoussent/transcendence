FROM alpine:latest

RUN apk add --no-cache curl unzip bash jq

RUN curl -L https://releases.hashicorp.com/vault/1.15.2/vault_1.15.2_linux_amd64.zip -o vault.zip && \
    unzip vault.zip && \
    mv vault /usr/local/bin/ && \
    rm vault.zip

RUN mkdir -p /vault/data

EXPOSE 8200

ENV VAULT_ADDR=http://vault:8200

COPY config.hcl /vault/config.hcl
COPY tools/vault.sh /vault.sh

RUN chmod +x /vault.sh

ENTRYPOINT [ "sh", "/vault.sh" ]
