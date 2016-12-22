import service from '../';
import express from 'express';
import request from 'supertest';
import handleError from '../../../services/http/middlewares/handle-error';

describe('plugins/badges-http', function () {

  let app, options, imports, router;

  beforeEach(function () {
    app = express();

    options = {};
    imports = {};

    router = service(options, imports);

    app.use(handleError());
    app.use('/', router);
  });

  it('should response `ok` on `/`', function (done) {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect('ok')
      .expect(200)
      .end(done);
  });

  it('should response with svg image', function (done) {
    request(app)
      .get('/user-text-red.svg')
      .expect('Content-Type', /image\/svg\+xml/)
      .expect(200)
      .end(done);
  });

});
