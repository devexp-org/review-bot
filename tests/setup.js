import path from 'path';
import { assert } from 'chai';
import sinon from 'sinon';
import * as config from 'app/lib/config';

config.init({ path: path.join(__dirname, 'config') });

sinon.assert.expose(assert, { prefix: '' });

require('app/lib/mongoose')(config.load('mongoose'));

global.sinon = sinon;
global.assert = assert;
