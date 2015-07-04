/* global __dirname */
import express from 'express';
import path from 'path';
import responseTime from 'response-time';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import proxy from 'proxy-express';

import * as config from 'app/core/config';

var app = express(),
    serverConfig = config.load('server');

/**
 * Setup server
 */
if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler());
    app.use(proxy('localhost:8080/public/app.js', '/public/app.js')); // TODO: Move proxy to config
}

app.use(responseTime());
app.use(bodyParser.json());
app.use(serverConfig.staticBase, express.static(serverConfig.staticPath));

/**
 * Server side modules
 */
require('app/core/mongoose').init(config.load('mongoose'));
require('app/core/models/addons').init(config.load('models'));
require('app/core/github/api').init(config.load('github'));
require('app/core/review/init').init(config.load('review'));

/**
 * Routes / Middlewares
 */
app.use(require('app/core/response')());
app.use('/api/github', require('app/core/github/routes'));
app.use('/api/review', require('app/core/review/routes'));

/**
 * Default Route
 * Should always be last
 */

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

export default app;
