FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
  build-base python3 make cmake git \
  sqlite-dev \
  && apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community gcompat \
  && apk add sqlcipher-dev \
  && apk add curl

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g sqlite3 && npm install uuid

RUN npm install otplib && npm install qrcode

RUN npm install node-fetch

# Create symlink for environment file
RUN ln -s /tmp/vault.env /app/.env

# Copy source code
COPY . .

EXPOSE 8000
RUN python3 -m venv /venv
RUN /venv/bin/pip install --no-cache --upgrade pip setuptools

RUN /venv/bin/pip install requests

CMD ["/venv/bin/python3", "entropy.py"]