import chai from 'chai';
import sinon from 'sinon';

const assert = chai.assert;

sinon.assert.expose(assert, { prefix: '' });

assert.alwaysReturned = function (spy, match) {
  assert(
    spy.alwaysReturned(match),
    spy.printf('expected %n to always be returned with ' + match + '%C')
  );
};

chai.config.truncateThreshold = 100;

global.chai = chai;
global.sinon = sinon;
global.assert = assert;

process.env.NODE_ENV = 'testing';
