FROM node:8-alpine

COPY package.json package-lock.json /

RUN npm install

COPY ./ /

RUN mkdir -p /repo

CMD ["node", "deploy.js"]
