/* global __dirname */
import express from 'express';
import path from 'path';
import responseTime from 'response-time';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import * as config from 'app/lib/config';

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
require('app/lib/mongoose')(config.load('mongoose'));

/**
 * Default Route
 * Should always be last
 */
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

export default app;
