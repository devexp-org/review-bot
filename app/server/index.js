/* global __dirname */
var express = require('express');
var path = require('path');
var responseTime = require('response-time');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var proxy = require('proxy-express');

var app = express();
var config = require('app/core/config');
var serverConfig = config.load('server');

/**
 * Setup server
 */
if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler());
}

if (process.env.WEBPACK_DEV) {
    app.use(proxy('localhost:' + (process.env.WEBPACK_DEV_PORT || 8080) + '/public/app.js', '/public/app.js'));
}

app.use(responseTime());
app.use(bodyParser.json());
app.use(serverConfig.staticBase, express.static(serverConfig.staticPath));

/**
 * Core modules
 */
require('app/core/mongoose').init(config.load('mongoose'));
require('app/core/models/addons').init(config.load('models'));
require('app/core/github/api').init(config.load('github'));
require('app/core/review/ranking').init(config.load('review'));
require('app/core/badges').init(config.load('badges'));

/**
 * Routes / Middlewares
 */
app.use(require('app/core/response')());
app.use(require('app/core/badges/proxy'));

app.use('/api/github', require('app/core/github/routes'));
app.use('/api/review', require('app/core/review/routes'));

/**
 * Plugins
 */
require('app/plugins');

/**
 * Default Route
 * Should always be last
 */

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

module.exports = app;
