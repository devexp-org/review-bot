/**
 * Setup for tests
 */
var path = require('path'),

    assert = require('chai').assert,
    sinon = require('sinon'),
    injector = require('modules/injector'),
    config = injector
        .register('config', require('modules/config'), { path: path.join(__dirname, 'config') })
        .get('config');

/**
 * Injecting modules
 */
injector
    .register('mongoose', require('modules/mongoose'), config.load('mongoose'))
    .initModules();

/**
 * Setup assertions
 */
sinon.assert.expose(assert, { prefix: '' });

/**
 * Define global accesible utils
 */
global.assert = assert;
global.sinon = sinon;
