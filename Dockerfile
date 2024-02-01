FROM node:20.11.0-bookworm-slim

WORKDIR /app

COPY package.json /app

RUN npm install

COPY ./server /app

CMD ["npm", "start"]
