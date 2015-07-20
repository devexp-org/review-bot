require('es6-promise').polyfill();

var path = require('path');
var config = require('app/core/config');
var mulilistener = require('app/server/multilistener');
var app, port, logger;

config.init({ path: path.join(__dirname, 'app/config'), cache: true });

/**
 * Log
 */
logger = require('app/core/logger');

/**
 * Handler for uncaught exceptions
 */
process.on('uncaughtException', function (err) {
    logger.error(err);
});

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
