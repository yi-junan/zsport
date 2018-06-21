/* eslint-disable */

const Koa = require('koa');
const serve = require('koa-static');
const mount = require('koa-mount');
const proxy = require('koa-better-http-proxy');
const fs = require('fs');
const app = new Koa();
const port = 5050;

app.use(async (ctx, next) => {
  await next();
});

app.use(serve('./dist'));
app.use(proxy('https://demoadmin2.qualitrip.cn/'));

app.listen(port);
