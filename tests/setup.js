/**
 * Global test helpers.
 */
var path = require('path'),

    chai = require('chai'),
    injector = require('modules/injector'),
    config = injector
        .register('config', require('modules/config'), { path: path.join(__dirname, 'config') })
        .get('config');

injector
    .register('mongoose', require('modules/mongoose'), config.load('mongoose'))
    .initModules();

global.assert = chai.assert;
