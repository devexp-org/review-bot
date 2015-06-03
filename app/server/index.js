var express = require('express'),
    path = require('path'),
    responseTime = require('response-time'),

    app = express();

/**
 * Setup application
 */

if (process.env.NODE_ENV !== 'production') {
    app.use(require('errorhandler')());
}

app.use(responseTime());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

/**
 * Serverside modules
 */

require('app/module/mongoose');

/**
 * Default Route
 */

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

module.exports = app;
