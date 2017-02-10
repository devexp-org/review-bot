import { merge, withApp } from '../app';
import { withModel } from '../model/';
import { withGitHub } from '../github';
import { withTeamModel } from '../model/model-team';
import { withPullRequestModel } from '../model/model-pull-request';
import { withTeamManager } from '../team-manager/';

export function withTeamDriverGitHub(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-manager': {
          options: {
            drivers: {
              github: 'team-driver-github'
            }
          },
          dependencies: [
            'team-driver-github'
          ]
        },
        'team-driver-github': {
          path: './src/services/team-manager/driver-github',
          dependencies: [
            'github'
          ]
        }
      }
    }, config);

    next(imports => {
      const TeamModel = imports.model('team');

      return TeamModel
        .findByName('test-team').then(team => {
          team.set({
            driver: {
              name: 'github',
              options: { orgName: 'devexp-org' }
            },
            patterns: ['artems/devkit']
          });

          return team.save();
        })
        .then(team => {
          imports.team = team;
          return imports;
        })
        .then(test);

    }, config, done);

  };

}

describe.only('services/team-manager/driver-github', function () {

  const test = withTeamDriverGitHub(
    withTeamManager(
      withTeamModel(
        withPullRequestModel(
          withModel(
            withGitHub(
              withApp
            )
          )
        )
      )
    )
  );

  describe('#getCandidates', function () {

    it('should get candidates using GitHub API (-slugName)', function (done) {

      test(imports => {
        const manager = imports['team-manager'];
        const TeamModel = imports.model('team');
        const pullRequest = imports.pullRequest;

        return TeamModel
          .findByName('test-team').then(team => {
            team.set({
              driver: {
                options: { orgName: 'devexp-org' }
              }
            });
            return team.save();
          })
          .then(() => {
            return manager.findTeamByPullRequest(pullRequest);
          })
          .then(teamDriver => {
            return teamDriver.getCandidates();
          })
          .then(candidates => {
            assert.sameMembers(
              candidates.map(x => x.login),
                ['artems', 'd4rkr00t', 'mishanga', 'sbmaxx']
            );
          });
      }, {}, done);

    });

    it('should get candidates using GitHub API (+slugName)', function (done) {

      test(imports => {
        const manager = imports['team-manager'];
        const TeamModel = imports.model('team');
        const pullRequest = imports.pullRequest;

        return TeamModel
          .findByName('test-team').then(team => {
            team.set({
              driver: {
                options: { orgName: 'devexp-org', slugName: 'all' }
              }
            });
            return team.save();
          })
          .then(() => {
            return manager.findTeamByPullRequest(pullRequest);
          })
          .then(teamDriver => {
            return teamDriver.getCandidates();
          })
          .then(candidates => {
            assert.sameMembers(
              candidates.map(x => x.login),
                ['artems', 'd4rkr00t', 'mishanga', 'sbmaxx']
            );
          });
      }, {}, done);

    });

  });

  describe('#findTeamByPullRequest', function () {

    it('should find user using GitHub API', function (done) {

      test(imports => {
        const manager = imports['team-manager'];
        const pullRequest = imports.pullRequest;

        return manager.findTeamByPullRequest(pullRequest)
          .then(teamDriver => {
            return teamDriver.findTeamMember('veged');
          })
          .then(user => assert.equal(user.login, 'veged'));
      }, {}, done);

    });

  });

});
