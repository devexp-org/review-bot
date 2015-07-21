/* global __dirname */
var express = require('express');
var path = require('path');
var responseTime = require('response-time');
var bodyParser = require('body-parser');
var proxy = require('proxy-express');

var app = express();
var logger = require('app/modules/logger');
var config = require('app/modules/config');
var serverConfig = config.load('server');

/**
 * Setup server
 */
if (process.env.WEBPACK_DEV) {
    app.use(proxy('localhost:' + (process.env.WEBPACK_DEV_PORT || 8080) + '/public/app.js', '/public/app.js'));
}

app.use(responseTime());
app.use(bodyParser.json());
app.use(serverConfig.staticBase, express.static(serverConfig.staticPath));

/**
 * Routes / Middlewares
 */
app.use(require('app/modules/response')());
app.use(require('app/modules/badges/proxy'));

app.use('/api/github', require('app/modules/github/routes'));
app.use('/api/review', require('app/modules/review/routes'));

/**
 * Default Routes
 * Should always be last
 */

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

app.use(function (err, req, res, next) { // eslint-disable-line
    logger.error(err);
    res.error(err.stack);
});

module.exports = app;
