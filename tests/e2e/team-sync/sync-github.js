import { merge, withApp, withInitial } from '../app';
import { withGitHub } from '../github';
import { withModelSuite } from '../model/';
import { withTeamSync } from '../team-sync';
import { withTeamManagerSuite } from '../team-manager';
import { withTeamSearchGitHub } from '../team-search/search-github';

export function withTeamSyncGitHub(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-sync': {
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
          path: './src/services/team-sync/driver-github',
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
            }
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

describe('services/team-sync/sync-github', function () {

  const test = withTeamSyncGitHub(
    withTeamSync(
      withTeamSearchGitHub(
        withTeamManagerSuite(
          withModelSuite(
            withGitHub(
              withInitial(
                withApp
              )
            )
          )
        )
      )
    )
  );

  describe('#getMembers', function () {

    it('should get members by using GitHub API (-slugName)', function (done) {

      test(imports => {
        const sync = imports['team-sync'];
        const TeamModel = imports.model('team');

        return TeamModel
          .findByName('test-team').then(team => {
            team.set({
              driver: {
                options: { orgName: 'devexp-org' }
              }
            });
            return team.save();
          })
          .then(() => sync.getTeamDriver('test-team'))
          .then(teamDriver => teamDriver.getMembers())
          .then(candidates => {
            assert.sameMembers(
              candidates.map(x => x.login),
              ['artems', 'd4rkr00t', 'mishanga', 'sbmaxx']
            );
          });
      }, {}, done);

    });

    it('should get candidates by using GitHub API (+slugName)', function (done) {

      test(imports => {
        const sync = imports['team-sync'];
        const TeamModel = imports.model('team');

        return TeamModel
          .findByName('test-team').then(team => {
            team.set({
              driver: {
                options: {
                  orgName: 'devexp-org',
                  slugName: 'all'
                }
              }
            });
            return team.save();
          })
          .then(() => sync.getTeamDriver('test-team'))
          .then(teamDriver => teamDriver.getMembers())
          .then(candidates => {
            assert.sameMembers(
              candidates.map(x => x.login),
              ['artems', 'd4rkr00t', 'mishanga', 'sbmaxx']
            );
          });
      }, {}, done);

    });

  });

});
