import { merge, withApp } from '../app';
import { withModel } from '../model/';
import { withGitHub } from '../github';
import { withTeamModel } from '../model/model-team';
import { withPullRequestModel } from '../model/model-pull-request';
import { withTeamManager } from '../team-manager/';
import defaultConfig from '../../../config/default';

export function withTeamDriverGitHub(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-manager': {
          options: {
            drivers: ['team-driver-github']
          },
          dependencies: [
            'team-driver-github'
          ]
        },
        'team-driver-github': {
          path: defaultConfig.services['team-driver-github'].path,
          dependencies: [
            'model',
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
              options: {
                orgName: 'devexp-org'
              }
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

describe('services/team-manager/driver-github', function () {

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

  it('should get candidates using GitHub API', function (done) {

    test(imports => {
      const manager = imports['team-manager'];
      const pullRequest = imports.pullRequest;

      return manager.findTeamByPullRequest(pullRequest)
        .then(teamDriver => {
          return teamDriver.getCandidates();
        })
        .then(candidates => {
          assert.sameMembers(
            candidates.map(x => x.login),
            ['artems', 'd4rkr00t', 'sbmaxx']
          );
        });
    }, {}, done);

  });

  it('should find user using GitHub API', function (done) {

    test(imports => {
      const manager = imports['team-manager'];
      const pullRequest = imports.pullRequest;

      return manager.findTeamByPullRequest(pullRequest)
        .then(teamDriver => {
          return teamDriver.findTeamMember('mishanga');
        })
        .then(user => assert.equal(user.login, 'mishanga'));
    }, {}, done);

  });

});
