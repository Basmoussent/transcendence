FROM alpine:latest

RUN apk add --no-cache curl unzip bash jq

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN apk add openssl
RUN python3 -m venv /venv
RUN /venv/bin/pip install --no-cache --upgrade pip setuptools

COPY cert.conf /vault/cert.conf

RUN openssl req -x509 -batch -nodes -newkey rsa:2048 -keyout /vault/selfsigned.key -out /vault/selfsigned.crt -config /vault/cert.conf -days 365

# RUN curl -L https://releases.hashicorp.com/vault/1.15.2/vault_1.15.2_linux_amd64.zip -o vault.zip && \
#     unzip -o vault.zip && \
#     mv vault /usr/local/bin/ && \
#     rm vault.zip

RUN mkdir -p /tmp/vault-install && cd /tmp/vault-install && \
    curl -L https://releases.hashicorp.com/vault/1.15.2/vault_1.15.2_linux_amd64.zip -o vault.zip && \
    unzip -o vault.zip && \
    mv vault /usr/local/bin/ && \
    cd / && rm -rf /tmp/vault-install

RUN mkdir -p /vault/data

EXPOSE 8200

ENV VAULT_ADDR=https://vault:8200

COPY config.hcl /vault/config.hcl
COPY tools/vault.py /vault.py
COPY tools/requirements.txt /requirements.txt

RUN /venv/bin/pip install -r /requirements.txt
RUN chmod +x /vault.py


ENTRYPOINT [ "/venv/bin/python3", "/vault.py" ]
