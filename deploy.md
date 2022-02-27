Docker deployment via Heroku.

```shell
heroku login
heroku container:login

npm run build # build the production client/server apps
npm run build:docker # build the image using the built apps
npm run deploy # to heroku

```
