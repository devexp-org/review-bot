import { merge, withApp } from '../app';
import { withModel } from '../model/';
import { withTeamModel } from '../model/model-team';
import { withUserModel } from '../model/model-user';
import { withPullRequestModel } from '../model/model-pull-request';
import { withTeamManager } from '../team-manager/';

export function withTeamDriverStatic(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-manager': {
          options: {
            drivers: ['team-driver-static']
          },
          dependencies: [
            'team-driver-static'
          ]
        },
        'team-driver-static': {
          path: './src/services/team-manager/driver-static',
          dependencies: [
            'model'
          ]
        }
      }
    }, config);

    next(imports => {
      const UserModel = imports.model('user');
      const TeamModel = imports.model('team');

      const foo = new UserModel({ login: 'foo' });
      const bar = new UserModel({ login: 'bar' });

      return Promise.all([foo.save(), bar.save()])
        .then(() => {
          return TeamModel.findByName('test-team').then(team => {
            team.set({
              driver: { name: 'static' },
              members: [foo, bar],
              patterns: ['artems/devkit']
            });
            return team.save();
          });
        })
        .then(team => {
          imports.team = team;
          return imports;
        })
        .then(test);

    }, config, done);

  };

}

describe('services/team-manager/driver-static', function () {

  const test = withTeamDriverStatic(
    withTeamManager(
      withTeamModel(
        withUserModel(
          withPullRequestModel(
            withModel(
              withApp
            )
          )
        )
      )
    )
  );

  describe('#getCandidates', function () {

    it('should get candidates from database', function (done) {

      test(imports => {
        const manager = imports['team-manager'];
        const pullRequest = imports.pullRequest;

        manager.findTeamByPullRequest(pullRequest)
          .then(teamDriver => {
            return teamDriver.getCandidates();
          })
          .then(candidates => {
            assert.sameMembers(
              candidates.map(x => x.login),
                ['foo', 'bar']
            );
          });
      }, {}, done);

    });

  });

  describe('#findTeamByPullRequest', function () {

    it('should find user from database', function (done) {

      test(imports => {
        const manager = imports['team-manager'];
        const pullRequest = imports.pullRequest;

        manager.findTeamByPullRequest(pullRequest)
          .then(teamDriver => {
            return teamDriver.findTeamMember('foo');
          })
          .then(user => assert.equal(user.login, 'foo'));
      }, {}, done);

    });

  });

});
