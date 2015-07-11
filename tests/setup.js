require('es6-promise').polyfill();

var path = require('path');
var assert = require('chai').assert;
var sinon = require('sinon');
var config = require('app/core/config');

config.init({ path: path.join(__dirname, '..', 'app', 'config'), test: true });

sinon.assert.expose(assert, { prefix: '' });

require('app/core/mongoose').init(config.load('mongoose'));

global.sinon = sinon;
global.assert = assert;
