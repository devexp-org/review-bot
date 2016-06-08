import service from '../';
import express from 'express';
import request from 'supertest';
import responseJSON from '../../../services/http/response';

describe('plugins/badges-http', function () {

  let app, options, imports, router;

  beforeEach(function () {
    app = express();

    options = {};
    imports = {};

    router = service(options, imports);

    app.use(responseJSON());
    app.use('/', router);
  });

  it('should response `ok` on `/badges`', function (done) {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .expect('ok')
      .end(done);
  });

  it.skip('should response with svg image', function (done) {
    request(app)
      .get('/user-text-red.svg')
      .expect('Content-Type', /image\/svg\+xml/)
      .expect(200)
      .end(done);
  });

});
