/* global __dirname */
var express = require('express'),
    path = require('path'),

    app = express(),
    config = require('app/config');

require('node-jsx').install();

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'app/server/views'));
app.set('view engine', 'ejs');

/**
 * App
 */
require('app/lib/mongoose');
require('app/server')(app);

/**
 * Server
 */
app.listen(config.app.port);
console.log('App started on http://localhost:' + config.app.port);
