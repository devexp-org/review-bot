'use strict';

import chai from 'chai';
import sinon from 'sinon';

require('babel-polyfill');

const assert = chai.assert;

sinon.assert.expose(assert, { prefix: '' });

global.chai = chai;
global.sinon = sinon;
global.assert = assert;
