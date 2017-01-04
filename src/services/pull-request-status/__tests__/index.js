import service from '../index';

import eventsMock from '../../../services/events/__mocks__/';
import loggerMock from '../../../services/logger/__mocks__/';
import pullRequestGitHubMock from '../../../services/pull-request-github/__mocks__/';
import { pullRequestMock } from
  '../../../services/model/model-pull-request/__mocks__/';
import teamManagerMock, { teamDriverMock } from
  '../../../services/team-manager/__mocks__/';

describe('plugins/pull-request-status', function () {

  let team, events, logger, payload, options, imports;
  let pullRequest, pullRequestGitHub, teamManager;

  beforeEach(function () {

    team = teamDriverMock();
    events = eventsMock();
    logger = loggerMock();
    teamManager = teamManagerMock(team);
    pullRequestGitHub = pullRequestGitHubMock();

    pullRequest = pullRequestMock();

    options = {};

    imports = {
      events,
      logger,
      'team-manager': teamManager,
      'pull-request-github': pullRequestGitHub
    };

    payload = { pullRequest };

  });

  it('should update status for pull request on github if review started', function (done) {
    team.getOption
      .withArgs('setGitHubReviewStatus')
      .returns(true);

    events.on
      .withArgs('review:started')
      .callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.calledWith(
        pullRequestGitHub.setDeploymentStatus,
        pullRequest
      );
      done();
    }, 0);
  });

  it('should not update status if team option `setGitHubReviewStatus` set to `false`', function (done) {
    team.getOption
      .withArgs('setGitHubReviewStatus')
      .returns(false);

    events.on
      .withArgs('review:started')
      .callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(pullRequestGitHub.setDeploymentStatus);
      done();
    }, 0);
  });

  it('should return rejected promise if team is not found', function (done) {
    team.getOption
      .withArgs('setGitHubReviewStatus')
      .returns(true);

    events.on
      .withArgs('review:started')
      .callsArgWith(1, payload);

    teamManager.findTeamByPullRequest
      .returns(Promise.resolve(null));

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(pullRequestGitHub.setDeploymentStatus);
      done();
    }, 0);
  });

});
