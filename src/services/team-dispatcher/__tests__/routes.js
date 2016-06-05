import express from 'express';
import request from 'supertest';
import service from '../routes';
import responseJSON from '../../http/response';

import teamMock from '../__mocks__/team';
import loggerMock from '../../logger/__mocks__/';
import teamDispatcherMock from '../__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/pull-request/__mocks__/';

describe('services/team-dispatcher/routes', function () {

  let app, options, imports, router;
  let team, logger, members, pullRequest, teamDispatcher, pullRequestModel;

  beforeEach(function () {
    app = express();

    team = teamMock();
    logger = loggerMock();
    members = [{ login: 'foo' }, { login: 'bar' }];
    pullRequest = pullRequestMock();
    teamDispatcher = teamDispatcherMock();
    pullRequestModel = pullRequestModelMock();

    options = {};
    imports = {
      logger,
      'team-dispatcher': teamDispatcher,
      'pull-request-model': pullRequestModel
    };

    pullRequestModel.findByRepositoryAndNumber
      .withArgs('github/hubot', '1')
      .returns(Promise.resolve(pullRequest));

    teamDispatcher.findTeamByPullRequest
      .withArgs(pullRequest)
      .returns(team);

    team.getMembersForReview.returns(Promise.resolve(members));

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(responseJSON());
    app.use('/', router);
  });

  it('should return team members for review', function (done) {
    request(app)
      .get('/pull/github/hubot/1')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect('{"data":[{"login":"foo"},{"login":"bar"}]}')
      .end(done);
  });

  it('should return error if pull request is not found', function (done) {
    pullRequestModel.findByRepositoryAndNumber
      .withArgs('github/hubot', '1')
      .returns(Promise.resolve(null));

    request(app)
      .get('/pull/github/hubot/1')
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect(/not found/)
      .end(done);
  });

  it('should return error if team is not found', function (done) {
    teamDispatcher.findTeamByPullRequest
      .withArgs(pullRequest)
      .returns(null);

    request(app)
      .get('/pull/github/hubot/1')
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .expect(/not found/)
      .end(done);
  });

});
