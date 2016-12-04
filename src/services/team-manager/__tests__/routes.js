import express from 'express';
import request from 'supertest';
import service from '../routes';
import responseJSON from '../../http/response';
import responseModel from '../../model/response';

import { driverFrontEndMock } from '../__mocks__/driver';
import loggerMock from '../../logger/__mocks__/';
import teamManagerMock from '../__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/model-pull-request/__mocks__/';

describe('services/team-manager/routes', function () {

  let app, options, imports, router;
  let driver, logger, members, pullRequest, teamManager, pullRequestModel;

  beforeEach(function () {
    app = express();

    logger = loggerMock();
    driver = driverFrontEndMock();
    members = [{ login: 'foo' }, { login: 'bar' }];
    pullRequest = pullRequestMock();
    teamManager = teamManagerMock();
    pullRequestModel = pullRequestModelMock();

    options = {};
    imports = {
      logger,
      'team-manager': teamManager,
      'pull-request-model': pullRequestModel
    };

    teamManager.findTeamByPullRequest
      .withArgs(pullRequest)
      .returns(driver);

    pullRequestModel.findByRepositoryAndNumber
      .withArgs('github/hubot', '1')
      .returns(Promise.resolve(pullRequest));

    driver.getMembersForReview.returns(Promise.resolve(members));

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(responseJSON());
    app.use(responseModel());
    app.use('/', router);
  });

  describe('GET /:org/:repo/:number/members', function () {

    it('should return team members for review', function (done) {
      request(app)
        .get('/github/hubot/1/members')
        .expect('[{"login":"foo"},{"login":"bar"}]')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if pull request is not found', function (done) {
      pullRequestModel.findByRepositoryAndNumber
        .withArgs('github/hubot', '1')
        .returns(Promise.resolve(null));

      request(app)
        .get('/github/hubot/1/members')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

    it('should return an error if team is not found', function (done) {
      teamManager.findTeamByPullRequest
        .withArgs(pullRequest)
        .returns(null);

      request(app)
        .get('/github/hubot/1/members')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });
  });

});
