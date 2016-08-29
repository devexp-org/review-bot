import express from 'express';
import request from 'supertest';
import service from '../routes';
import bodyParser from 'body-parser';
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
    app.use(bodyParser.json());
    app.use(responseJSON());
    app.use('/', router);
  });


  describe('/add', function () {

    it('should create a new user', function (done) {
      request(app)
        .post('/add')
        .field('login', 'testuser')
        .expect('{"data":{"_id":"testuser","contacts":[],"login":"testuser"}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if user already exsits', function (done) {
      const user = new UserModel();

      user.save.returns(Promise.reject(new Error('User "testuser" already exists')));

      request(app)
        .post('/add')
        .field('login', 'testuser')
        .expect('{"error":"User \\"testuser\\" already exists"}')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

  describe('/get/:login', function () {

    it('should return user', function (done) {
      request(app)
        .get('/get/testuser')
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
        .get('/get/foo')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

});
