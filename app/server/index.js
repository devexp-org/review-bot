var express = require('express'),
    path = require('path'),

    app = express();

/**
 * Setup application
 */
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app/server/views'));

/**
 * Serverside modules
 */

/**
 * Default Route
 */

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

module.exports = app;
