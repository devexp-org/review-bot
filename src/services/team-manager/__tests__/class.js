import TeamManager from '../class';
import { teamModelMock } from '../../model/model-team/__mocks__/';
import { pullRequestMock } from '../../model/model-pull-request/__mocks__/';
import { teamDriverFactoryMock } from '../__mocks__/';

describe('services/team-manager/class', function () {

  let teamModel, pullRequest, teamDriverFactory;

  beforeEach(function () {
    teamModel = teamModelMock();

    pullRequest = pullRequestMock();

    teamDriverFactory = teamDriverFactoryMock();

    pullRequest.repository.full_name = 'nodejs/node';
  });

  describe('#findTeamByPullRequest', function () {

    let team, manager;

    beforeEach(function () {
      team = {
        name: 'team1',
        driver: { name: 'static', options: {} },
        patterns: ['nodejs/node']
      };

      teamModel.findByName
        .withArgs('team1')
        .returns(Promise.resolve(team));

      teamDriverFactory.makeDriver
        .withArgs(team)
        .returns(1);

      manager = new TeamManager({ 'static': teamDriverFactory }, teamModel);
    });

    it('should use the first matched route', function (done) {
      const otherTeam = { name: 'team2', driver: { name: 'static' } };

      teamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['github/hubot'] },
        { name: 'team2', patterns: ['nodejs/node'] },
        { name: 'team3', patterns: ['*'] }
      ]));

      teamModel.findByName
        .withArgs('team2')
        .returns(Promise.resolve(otherTeam));

      teamDriverFactory.makeDriver
        .withArgs(otherTeam)
        .returns(2);

      manager.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result, 2))
        .then(done, done);
    });

    it('should interpret "*" as "always match"', function (done) {
      teamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['*'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result, 1))
        .then(done, done);
    });

    it('should understand wildcard', function (done) {
      teamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['nodejs/*'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result, 1))
        .then(done, done);
    });

    it('should return an error if there is no matched route', function (done) {
      teamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['other-org/other-repo'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /no one route match/i))
        .then(done, done);
    });

    it('should return an error if there is no matched driver', function (done) {
      team.driver.name = 'unknown';

      teamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['*'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /unknown driver/i))
        .then(done, done);
    });

  });

});