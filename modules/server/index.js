var express = require('express'),
    path = require('path'),
    responseTime = require('response-time'),
    bodyParser = require('body-parser'),

    injector = require('modules/injector'),
    app = express();

/**
 * Setup application
 */
module.exports.init = function (options) {
    if (process.env.NODE_ENV !== 'production') {
        app.use(require('errorhandler')());
    }

    app.use(responseTime());
    app.use(bodyParser.json());
    app.use(options.staticBase, express.static(options.staticPath));
};

/**
 * Default Route
 */
module.exports.setupDefaultRoute = function () {
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'views', 'layout.html'));
    });
};

module.exports.app = app;
