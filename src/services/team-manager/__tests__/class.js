import TeamManager from '../class';
import searchMock from '../__mocks__/search';
import { teamModelMock } from '../../model/model-team/__mocks__/';
import { pullRequestMock } from '../../model/model-pull-request/__mocks__/';
import { teamDriverFactoryMock } from '../__mocks__/';

describe('services/team-manager/class', function () {

  let TeamModel, pullRequest, teamDriverFactory, search;

  beforeEach(function () {
    search = searchMock();

    TeamModel = teamModelMock();

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

      TeamModel.findByName
        .withArgs('team1')
        .returns(Promise.resolve(team));

      manager = new TeamManager(TeamModel, { 'static': teamDriverFactory }, search);

      teamDriverFactory.makeDriver
        .withArgs(manager, team)
        .returns(1);
    });

    it('should use the first matched route', function (done) {
      const otherTeam = { name: 'team2', driver: { name: 'static' } };

      TeamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['github/hubot'] },
        { name: 'team2', patterns: ['nodejs/node'] },
        { name: 'team3', patterns: ['*'] }
      ]));

      TeamModel.findByName
        .withArgs('team2')
        .returns(Promise.resolve(otherTeam));

      teamDriverFactory.makeDriver
        .withArgs(manager, otherTeam)
        .returns(2);

      manager.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result, 2))
        .then(done, done);
    });

    it('should interpret "*" as "always match"', function (done) {
      TeamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['*'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result, 1))
        .then(done, done);
    });

    it('should understand wildcard', function (done) {
      TeamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['nodejs/*'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result, 1))
        .then(done, done);
    });

    it('should return an error if there is no matched route', function (done) {
      TeamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['other-org/other-repo'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /no one route match/i))
        .then(done, done);
    });

    it('should return an error if there is no matched driver', function (done) {
      team.driver.name = 'unknown';

      TeamModel.exec.returns(Promise.resolve([
        { name: 'team1', patterns: ['*'] }
      ]));

      manager.findTeamByPullRequest(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /unknown driver/i))
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {
    let manager;

    beforeEach(function () {
      manager = new TeamManager(TeamModel, { 'static': teamDriverFactory }, search);
    });

    it('should search user using `search` driver', function () {
      manager.findTeamMember('foo');
      assert.calledWith(search.findUser, 'foo');
    });
  });

});
