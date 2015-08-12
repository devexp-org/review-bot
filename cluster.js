/* eslint-disable no-var, no-console */
'use strict';

require('babel/register');

var basePath = __dirname;
var appConfig = require('./modules/config')(basePath);
var recluster = require('recluster');

var cluster = recluster('start.js', {
  workers: appConfig.cluster.workers
});

process.on('uncaughtException', function (error) {
  console.error(error.stack);
});

process.on('SIGUSR2', function () {
  cluster.reload();
});

cluster.run();
