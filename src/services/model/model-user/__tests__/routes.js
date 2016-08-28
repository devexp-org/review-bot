import express from 'express';
import request from 'supertest';
import service from '../routes';
import responseJSON from '../../../http/response';

import modelMock from '../../../model/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { userMock, userModelMock } from '../__mocks__/';

describe('services/model/model-user/routes', function () {

  let app, options, imports, router;
  let model, logger, user, UserModel;

  beforeEach(function () {
    app = express();

    user = userMock();
    model = modelMock();
    logger = loggerMock();
    UserModel = userModelMock();

    options = {};
    imports = { logger, model };

    model
      .withArgs('user')
      .returns(UserModel);

    UserModel.findByLogin
      .withArgs('testuser')
      .returns(Promise.resolve(user));

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(responseJSON());
    app.use('/', router);
  });

  it('should return user', function (done) {
    request(app)
      .get('/by-login/testuser')
      .expect('{"data":{"_id":"testuser","contacts":[],"login":"testuser"}}')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .end(done);
  });

  it('should return error if user is not found', function (done) {
    UserModel.findByLogin
      .withArgs('foo')
      .returns(Promise.resolve(null));

    request(app)
      .get('/by-login/foo')
      .expect(/not found/)
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .end(done);
  });

});
