require('babel/register');

var path = require('path');
var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
var config = require('app/modules/config');
var chaiAsPromised = require('chai-as-promised');

config.init({ path: path.join(__dirname, '..', 'app', 'config'), test: true });

chai.use(chaiAsPromised);
sinon.assert.expose(assert, { prefix: '' });

require('app/modules/mongoose').init(config.load('mongoose'));

global.sinon = sinon;
global.assert = assert;
