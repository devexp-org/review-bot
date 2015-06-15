// Enable all ES6 features
require('babel/register')({
    loose: ['es6.classes', 'es6.modules', 'es6.properties.computed', 'es6.templateLiterals']
});

var path = require('path'),
    config = require('app/core/config'),
    app,
    port,
    logger;

config.init({ path: path.join(__dirname, 'config') });

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
app.listen(port);
logger.info('App started on http://localhost:' + port);
