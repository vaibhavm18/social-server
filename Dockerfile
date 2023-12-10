FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install -g pnpm

RUN pnpm i

COPY . .

CMD ["pnpm", "dev"]