FROM node:6-alpine

COPY src /app/src
COPY config /app/config
COPY .babelrc /app/.babelrc
COPY start.js /app/start.js
COPY node_modules /app/node_modules
COPY package.json /app/package.json

WORKDIR /app

ENV NODE_ENV production

CMD npm start
