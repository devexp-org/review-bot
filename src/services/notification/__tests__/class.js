import Notification from '../class';

import { userMock } from '../../model/model-user/__mocks__/';
import { transportMock } from '../__mocks__/';
import teamManagerMock, { teamDriverMock } from
  '../../team-manager/__mocks__/';
import { pullRequestMock } from
  '../../model/model-pull-request/__mocks__/';

describe('services/notification/class', function () {

  let user, pullRequest, teamDriver, teamManager, notification, transports;

  beforeEach(function () {

    user = userMock();

    teamDriver = teamDriverMock();

    teamManager = teamManagerMock(teamDriver);

    pullRequest = pullRequestMock();

    teamDriver.getOption
      .withArgs('notification')
      .returns('email');

    teamDriver.findTeamMember
      .withArgs('octocat')
      .returns(Promise.resolve(user));

    transports = { email: transportMock() };

    notification = new Notification(transports, teamManager);

  });

  it('should be able to send message using given transport', function (done) {
    notification.sendMessage(pullRequest, 'octocat', 'message')
      .then(() => assert.calledWith(transports.email.send, user, 'message'))
      .then(done, done);
  });

  it('should reject promise if team is not found', function (done) {
    teamManager.findTeamByPullRequest
      .returns(Promise.resolve(null));

    notification.sendMessage(pullRequest, 'user', 'message')
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /team .* not found/))
      .then(done, done);
  });

  it('should reject promise if transport is not found', function (done) {
    notification = new Notification({}, teamManager);

    notification.sendMessage(pullRequest, 'user', 'message')
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /transport .* not found/))
      .then(done, done);
  });

  it('should reject promise if user is not found', function (done) {
    teamDriver.findTeamMember
      .withArgs('foo')
      .returns(Promise.resolve(null));

    notification.sendMessage(pullRequest, 'foo', 'message')
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /user .* not found/))
      .then(done, done);
  });

});
