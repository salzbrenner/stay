FROM node:14.1.0

WORKDIR /usr/src/app

COPY ./server/package.json ./package.json
RUN npm install
COPY ./server/build ./
RUN mkdir client
COPY ./client/build ./client/

env GENERATE_SOURCEMAP=false

EXPOSE 9000

CMD ["node", "index.js"]  