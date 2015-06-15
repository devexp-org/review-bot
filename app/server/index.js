/* global __dirname */
import express from 'express';
import path from 'path';
import responseTime from 'response-time';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import * as config from 'app/core/config';

var app = express(),
    serverConfig = config.load('server');

/**
 * Setup server
 */
if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler());
}

app.use(responseTime());
app.use(bodyParser.json());
app.use(serverConfig.staticBase, express.static(serverConfig.staticPath));

/**
 * Server side modules
 */
require('app/core/mongoose')(config.load('mongoose'));
require('app/core/github/api').init(config.load('github'));

/**
 * Routes / Middlewares
 */
app.use(require('app/core/response').middleware());
app.use('/api/github', require('app/core/github/routes'));

/**
 * Default Route
 * Should always be last
 */
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

export default app;
