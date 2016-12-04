import express from 'express';
import request from 'supertest';
import service from '../routes';
import responseJSON from '../../http/response';

import loggerMock from '../../logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/model-pull-request/__mocks__/';
import { pullRequestModelReviewMixin } from '../__mocks__/';

describe('services/pull-request-review/routes', function () {

  let app, options, imports, router;
  let logger, pullRequest, pullRequestModel;

  beforeEach(function () {
    app = express();

    logger = loggerMock();
    pullRequest = pullRequestMock();
    pullRequestModel = pullRequestModelMock(null, pullRequestModelReviewMixin);

    options = {};
    imports = {
      logger,
      'pull-request-model': pullRequestModel
    };

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(responseJSON());
    app.use('/', router);
  });

  describe('GET /:id', function () {

    it('should return pull request', function (done) {
      pullRequestModel.findById
        .withArgs('1')
        .returns(Promise.resolve(pullRequest));

      request(app)
        .get('/1')
        .expect(/"id":1/)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

  describe('GET /pulls-by/:username', function () {

    it('should return pull request by user', function (done) {
      pullRequestModel.findByUser
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

  describe('GET /reviews-by/:username', function () {

    it('should return reviews by user', function (done) {
      pullRequestModel.findByReviewer
        .withArgs('foo')
        .returns(Promise.resolve([pullRequest]));

      request(app)
        .get('/reviews-by/foo')
        .expect(/"id":1/)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

  it('should return error when error', function (done) {
    pullRequestModel.findById
      .withArgs('1')
      .returns(Promise.reject(new Error('just error')));

    request(app)
      .get('/1')
      .expect('{"message":"just error"}')
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .end(done);
  });

});
