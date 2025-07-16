FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install qrcode

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]