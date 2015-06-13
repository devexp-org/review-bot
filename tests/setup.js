var assert = require('chai').assert,
    sinon = require('sinon');

sinon.assert.expose(assert, { prefix: '' });

global.sinon = sinon;
global.assert = assert;
