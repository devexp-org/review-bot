import express from 'express';
import request from 'supertest';
import service from '../routes';
import bodyParser from 'body-parser';
import handleError from '../../../http/middlewares/handle-error';

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
    app.use(handleError());
    app.use('/', router);
  });

  describe('GET /', function () {

    beforeEach(function () {
      UserModel.exec.returns(Promise.resolve([user]));
    });

    it('should return a user list', function (done) {
      request(app)
        .get('/')
        .expect('[{"login":"testuser","contacts":[]}]')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

  describe('POST /', function () {

    it('should create a new user', function (done) {
      request(app)
        .post('/')
        .field('login', 'testuser')
        .expect('{"login":"testuser","contacts":[]}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if the user already exsits', function (done) {
      const user = new UserModel();

      user.save.returns(Promise.reject(new Error('User "testuser" already exists')));

      request(app)
        .post('/')
        .field('login', 'testuser')
        .expect('{"message":"User \\"testuser\\" already exists"}')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

  describe('GET /:id', function () {

    it('should return a user', function (done) {
      request(app)
        .get('/testuser')
        .expect('{"login":"testuser","contacts":[]}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if a user is not found', function (done) {
      UserModel.findByLogin
        .withArgs('foo')
        .returns(Promise.resolve(null));

      request(app)
        .get('/foo')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

  describe('PUT /:id', function () {

    let contacts;

    beforeEach(function () {
      contacts = [{ id: 'email', account: 'test@example.com' }];
    });

    it('should update a user', function (done) {
      request(app)
        .put('/testuser')
        .send({ contacts })
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(() => {
          assert(user.save.calledAfter(user.set));
          assert.calledWith(user.set, 'contacts', contacts);
          done();
        });
    });

    it('should delete all contacts if an empty body passed', function (done) {
      request(app)
        .put('/testuser')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(() => {
          assert.calledWith(user.set, 'contacts', []);
          done();
        });
    });

    it('should return an error if a user is not found', function (done) {
      UserModel.findByLogin
        .withArgs('foo')
        .returns(Promise.resolve(null));

      request(app)
        .put('/foo')
        .send({ contacts })
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

  describe('DELETE /:id', function () {

    it('should delete a user', function (done) {
      request(app)
        .delete('/testuser')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(() => {
          assert.called(user.remove);
          done();
        });
    });

    it('should return an error if a user is not found', function (done) {
      UserModel.findByLogin
        .withArgs('foo')
        .returns(Promise.resolve(null));

      request(app)
        .delete('/foo')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

});
