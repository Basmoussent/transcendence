FROM node:20-alpine


RUN apk add --no-cache \
  build-base python3 make cmake git \
  sqlite-dev \
  && apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community gcompat \
  && apk add sqlcipher-dev \
  && apk add curl

WORKDIR /app

RUN npm i @fastify/cookie@10.0.1
RUN npm i @fastify/jwt@9.1.0

COPY package*.json ./

RUN ln -s /tmp/vault.env /app/.env

RUN npm install

RUN npm install dotenv
RUN npm install --save-dev @types/node
RUN npm install -g sqlite3


COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]