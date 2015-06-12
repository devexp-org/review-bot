/* global __dirname */
import express from 'express';
import path from 'path';
import _config from 'app/lib/config';

var app = express(),
    config = _config.load('server');

/**
 * Route for static files
 */
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
