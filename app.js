require('babel/register');

var path = require('path');
var config = require('config');
var mulilistener = require('app/server/multilistener');
var app, port, logger;

/**
 * Log
 */
logger = require('app/modules/logger');

/**
 * Handler for uncaught exceptions
 */
process.on('uncaughtException', logger.error.bind(logger));

/**
 * Modules
 */
require('app/modules');

/**
 * Main Server Module
 */
app = require('app/server');
port = process.env.PORT || config.get('server').port;

/**
 * Start Server
 */
mulilistener(app, port);
logger.info('Server listening at http://localhost:%s', port);
