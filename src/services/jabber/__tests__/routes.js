import express from 'express';
import request from 'supertest';
import service from '../routes';
import responseJSON from '../../http/response';

import jabberMock from '../__mocks__/';

describe('services/jabber/routes', function () {

  let app, options, imports, router, jabber;

  beforeEach(function () {
    app = express();

    jabber = jabberMock();

    options = {};
    imports = { jabber };

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(responseJSON());
    app.use('/', router);
  });

  it('should send message to user', function (done) {
    request(app)
      .get('/test/foo')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect('ok')
      .end(() => {
        assert.called(jabber.send);
        done();
      });
  });

});
