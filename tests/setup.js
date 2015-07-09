// Enable all ES6 features
require('babel/register')({
    optional: ['es7.decorators', 'es7.classProperties', 'es7.functionBind'],
    loose: ['es6.classes', 'es6.modules', 'es6.properties.computed', 'es6.templateLiterals']
});

var path = require('path'),
    assert = require('chai').assert,
    sinon = require('sinon'),
    config = require('app/core/config');

config.init({ path: path.join(__dirname, 'config') });

sinon.assert.expose(assert, { prefix: '' });

require('app/core/mongoose').init(config.load('mongoose'));

global.sinon = sinon;
global.assert = assert;
