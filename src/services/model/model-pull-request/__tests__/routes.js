import express from 'express';
import request from 'supertest';
import service from '../routes';
import bodyParser from 'body-parser';
import handleError from '../../../http/middlewares/handle-error';

import modelMock from '../../../model/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from '../__mocks__/';

describe('services/model/model-pull-request/routes', function () {

  let app, options, imports, router;
  let model, logger, pullRequest, PullRequestModel;

  beforeEach(function () {

    app = express();

    model = modelMock();
    logger = loggerMock();
    pullRequest = pullRequestMock();
    PullRequestModel = pullRequestModelMock();

    options = {};
    imports = { logger, model };

    model
      .withArgs('pull_request')
      .returns(PullRequestModel);

    PullRequestModel.findById
      .withArgs('1')
      .returns(Promise.resolve(pullRequest));

    router = service(options, imports);

    app.use(bodyParser.json());
    app.use(handleError());

    app.use('/', router);

  });

  describe('GET /', function () {

    beforeEach(function () {
      PullRequestModel.exec.returns(Promise.resolve([pullRequest]));
    });

    it('should return a pull request list', function (done) {
      request(app)
        .get('/')
        .expect(/"id":1/)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

  describe('GET /:id', function () {

    it('should return a pull request', function (done) {
      request(app)
        .get('/1')
        .expect(/^{"id":1/)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if a pull request is not found', function (done) {
      PullRequestModel.findById
        .withArgs('1')
        .returns(Promise.resolve(null));

      request(app)
        .get('/1')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

  describe('GET /pulls-by/:username', function () {

    it('should return pull requests by user', function (done) {
      PullRequestModel.findByUser
        .withArgs('foo')
        .returns(Promise.resolve([pullRequest]));

      request(app)
        .get('/pulls-by/foo')
        .expect(/"id":1/)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

});
