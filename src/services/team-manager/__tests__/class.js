import TeamManager from '../class';
import { teamModelMock } from '../../model/model-team/__mocks__/';
import { pullRequestMock } from '../../model/model-pull-request/__mocks__/';

describe('services/team/class', function () {

  let teamModel, pullRequest;

  beforeEach(function () {
    teamModel = teamModelMock();

    pullRequest = pullRequestMock();

    pullRequest.repository.full_name = 'nodejs/node';
  });

  describe('#findTeamByPullRequest', function () {

    let dispatcher;

    beforeEach(function () {
      dispatcher = new TeamManager({}, teamModel);
    });

    it('should use team driver', function (done) {
      teamModel.findAll.returns(Promise.resolve([
        {
          name: 'team1',
          driver: { name: 'default', options: {} },
          patterns: ['nodejs/node']
        }
      ]));

      dispatcher.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result.name, 'team1'))
        .then(done, done);
    });

    it('should use the first matched route', function (done) {
      teamModel.findAll.returns(Promise.resolve([
        { name: 'team1', patterns: ['github/hubot'] },
        { name: 'team2', patterns: ['nodejs/node'] },
        { name: 'team3', patterns: ['*'] }
      ]));

      dispatcher.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result.name, 'team2'))
        .then(done, done);
    });

    it('should interpret "*" as "always match"', function (done) {
      teamModel.findAll.returns(Promise.resolve([
        { name: 'team1', patterns: ['*'] }
      ]));

      dispatcher.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result.name, 'team1'))
        .then(done, done);
    });

    it('should understand wildcard', function (done) {
      teamModel.findAll.returns(Promise.resolve([
        { name: 'team1', patterns: ['nodejs/*'] }
      ]));

      dispatcher.findTeamByPullRequest(pullRequest)
        .then(result => assert.equal(result.name, 'team1'))
        .then(done, done);
    });

    it('should return an error if there are no matched routes', function (done) {
      teamModel.findAll.returns(Promise.resolve([
        { name: 'team1', patterns: ['other-org/other-repo'] }
      ]));

      dispatcher.findTeamByPullRequest(pullRequest)
        .then(() => assert.fail())
        .catch(e => {
          assert.match(e.message, /no one route match/i);
        })
        .then(done, done);
    });

  });

});
