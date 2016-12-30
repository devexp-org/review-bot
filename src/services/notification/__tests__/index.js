import service from '../';
import { userMock } from '../../model/model-user/__mocks__/';
import { pullRequestMock } from
  '../../model/model-pull-request/__mocks__/';
import teamManagerMock, { teamDriverMock } from
  '../../team-manager/__mocks__/';

describe('services/notification', function () {

  let user, pullRequest, teamDriver, teamManager;
  let options, imports, notification, transport;

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

    transport = { send: sinon.stub() };

    options = {};

    imports = {
      'team-manager': teamManager,
      'notification-email': transport
    };

  });

  it('should be able to send message using given transport', function (done) {
    notification = service(options, imports);

    notification(pullRequest, 'octocat', 'message')
      .then(() => {
        transport.send.calledWith(user, 'message');
      })
      .then(done, done);
  });

  it('should reject promise if team is not found', function (done) {
    teamManager.findTeamByPullRequest
      .returns(Promise.resolve(null));

    notification = service(options, imports);

    notification(pullRequest, 'user', 'message')
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /team .* not found/))
      .then(done, done);
  });

  it('should reject promise if transport is not found', function (done) {
    delete imports['notification-email'];

    notification = service(options, imports);

    notification(pullRequest, 'user', 'message')
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /transport .* not found/))
      .then(done, done);
  });

  it('should reject promise if user is not found', function (done) {
    notification = service(options, imports);

    teamDriver.findTeamMember
      .withArgs('foo')
      .returns(Promise.resolve(null));

    notification(pullRequest, 'foo', 'message')
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /user .* not found/))
      .then(done, done);
  });

});
