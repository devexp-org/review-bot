FROM node:6-slim

WORKDIR /app

COPY src /app/src
COPY config /app/config
COPY .babelrc /app/.babelrc
COPY start.js /app/start.js
COPY package.json /app/package.json

ENV NODE_ENV production

RUN npm install --production

EXPOSE 80

CMD npm start
