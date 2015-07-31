require('babel/register');

var path = require('path');
var config = require('app/modules/config');
var mulilistener = require('app/server/multilistener');
var app, port, logger;

config.init({ path: path.join(__dirname, 'app/config'), cache: true });

/**
 * Log
 */
logger = require('app/modules/logger').default;

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
port = process.env.PORT || config.load('server').port;

/**
 * Start Server
 */
mulilistener(app, port);
logger.info('Server listening at http://localhost:%s', port);
