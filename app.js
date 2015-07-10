require('es6-promise').polyfill();

var path = require('path');
var config = require('app/core/config');
var mulilistener = require('app/server/multilistener');
var app;
var port;
var logger;

config.init({ path: path.join(__dirname, 'app/config') });

/**
 * Log
 */
logger = require('app/core/logger');

/**
 * Main Server Module
 */
app = require('app/server');
port = process.env.PORT || config.load('server').port;

/**
 * Start Server
 */
mulilistener(app, port);
logger.info('App started on http://localhost:' + port);
