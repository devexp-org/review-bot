/* global __dirname */
import express from 'express';
import path from 'path';
import responseTime from 'response-time';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import * as _config from 'app/lib/config';

var app = express(),
    config = _config.load('server');

/**
 * Setup server
 */
if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler());
}

app.use(responseTime());
app.use(bodyParser.json());
app.use(config.staticBase, express.static(config.staticPath));

/**
 * Server side modules
 */
// require('app/lib/mongoose');

/**
 * Default Route
 * Should always be last
 */
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

export default app;
