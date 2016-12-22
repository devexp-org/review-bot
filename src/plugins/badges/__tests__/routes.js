import express from 'express';
import request from 'supertest';
import service from '../routes';

import eventsMock from '../../../services/events/__mocks__/';
import loggerMock from '../../../services/logger/__mocks__/';
import handleError from '../../../services/http/middlewares/handle-error';
import { pullRequestMock, pullRequestModelMock } from
  '../../../services/model/model-pull-request/__mocks__/';

describe('services/badges', function () {

  let app, options, imports, router;
  let events, logger, pullRequest, pullRequestModel;

  beforeEach(function () {

    app = express();

    events = eventsMock();
    logger = loggerMock();
    pullRequest = pullRequestMock();
    pullRequestModel = pullRequestModelMock();

    options = {};
    imports = { events, logger, 'pull-request-model': pullRequestModel };

    pullRequestModel.findByRepositoryAndNumber
      .withArgs('org/repo', '1')
      .returns(Promise.resolve(pullRequest));

    router = service(options, imports);

    app.use(handleError());
    app.use('/', router);

  });

  it('should emit event `review:update_badges`', function (done) {
    request(app)
      .get('/org/repo/1/update-badges')
      .expect('"ok"')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .end(error => {
        assert.calledWith(events.emit, 'review:update_badges');
        done(error);
      });
  });

  it('should return an error if pull request is not found', function (done) {
    pullRequestModel.findByRepositoryAndNumber
      .withArgs('org/repo', '1')
      .returns(Promise.resolve(null));

    request(app)
      .get('/org/repo/1/update-badges')
      .expect('{"message":"Pull request org/repo#1 is not found"}')
      .expect('Content-Type', /application\/json/)
      .expect(404)
      .end(done);
  });

});
