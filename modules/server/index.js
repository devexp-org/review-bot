var express = require('express'),
    path = require('path'),
    responseTime = require('response-time'),
    bodyParser = require('body-parser'),

    app = express(),

    config = require('modules/config');

/**
 * Setup application
 */
if (process.env.NODE_ENV !== 'production') {
    app.use(require('errorhandler')());
}

app.use(responseTime());
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

/**
 * Serverside modules
 */
require('modules/mongoose').init(config.load('mongoose'));

app.use(require('modules/response').middleware());
app.use('/api/github', require('modules/github').routes);

/**
 * Default Route
 */
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

module.exports = app;
