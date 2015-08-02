require('babel/register');

var path = require('path');
var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
var config = require('config');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
sinon.assert.expose(assert, { prefix: '' });

require('app/modules/mongoose').init(config.get('mongoose'));

global.sinon = sinon;
global.assert = assert;
