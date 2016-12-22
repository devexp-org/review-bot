import express from 'express';
import request from 'supertest';
import service from '../routes';
import handleError from '../../../../services/http/middlewares/handle-error';

import jabberMock from '../__mocks__/';

describe.skip('services/jabber/routes', function () {

  let app, options, imports, router, jabber;

  beforeEach(function () {
    app = express();

    jabber = jabberMock();

    options = {};
    imports = { jabber };

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(handleError());
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
