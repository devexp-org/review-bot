import express from 'express';
import request from 'supertest';
import service from '../routes';
import handleError from '../../http/middlewares/handle-error';

import loggerMock from '../../logger/__mocks__/';
import notificationMock from '../__mocks__/';

describe('services/notification/routes', function () {

  let app, options, imports, router;
  let logger, notification, transports;

  beforeEach(function () {
    app = express();

    logger = loggerMock();
    notification = notificationMock();

    options = {};
    imports = { logger, notification };

    transports = {
      email: {},
      slack: {},
      jabber: {}
    };

    notification.getTransports.returns(transports);

    router = service(options, imports);

    app.use(handleError());
    app.use('/', router);

  });

  describe('GET /transports', function () {

    it('should return all transports', function (done) {
      request(app)
        .get('/transports')
        .expect('["email","slack","jabber"]')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

});
