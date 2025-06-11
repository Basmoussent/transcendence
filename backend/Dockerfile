FROM node:20-alpine


RUN apk add --no-cache \
  build-base python3 make cmake git \
  && apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community gcompat \
  && apk add sqlite


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"] 