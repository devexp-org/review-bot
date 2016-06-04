import path from 'path';
import express from 'express';
import request from 'supertest';
import service from '../index';

describe('services/http/routes/index', function () {

  let app, router;
  let options, imports;

  beforeEach(function () {
    app = express();

    options = {
      assets: path.resolve(__dirname, '../../__tests__/assets')
    };

    imports = {};

    router = service(options, imports);
  });

  it('should return index.html', function (done) {
    app.use(router);

    request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect('Content-Length', '96')
      .expect(200)
      .end(done);
  });

  it('should throw an error if assets path is not given', function () {
    options = {};
    assert.throws(() => service(options, imports), /assets/);
  });

});
