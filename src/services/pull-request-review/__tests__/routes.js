import express from 'express';
import request from 'supertest';
import service from '../routes';
import handleError from '../../http/middlewares/handle-error';

import modelMock from '../../model/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin, pullRequestModelReviewMixin } from
  '../__mocks__/';

describe('services/pull-request-review/routes', function () {

  let app, options, imports, router;
  let model, logger, pullRequest, PullRequestModel;

  beforeEach(function () {
    app = express();

    model = modelMock();
    logger = loggerMock();

    pullRequest = pullRequestMock();

    PullRequestModel = pullRequestModelMock(
      pullRequestReviewMixin,
      pullRequestModelReviewMixin
    );

    options = {};
    imports = { model, logger };

    model
      .withArgs('pull_request')
      .returns(PullRequestModel);

    router = service(options, imports);

    app.use(handleError());
    app.use('/', router);
  });

  describe('GET /reviews-by/:username', function () {

    it('should return reviews by user', function (done) {
      PullRequestModel.findByReviewer
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

});
