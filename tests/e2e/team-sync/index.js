import { merge, withApp, withInitial } from '../app';
import { withGitHub } from '../github';
import { withModelSuite } from '../model/';
import { withTeamSyncGitHub } from '../team-sync/sync-github';
import { withTeamManagerSuite } from '../team-manager';
import { withTeamSearchGitHub } from '../team-search/search-github';

export function withTeamSync(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-sync': {
          path: './src/services/team-sync',
          dependencies: [
            'model',
            'team-search',
            'team-manager'
          ]
        }
      }
    }, config);

    next(test, config, done);

  };

}

describe('services/team-sync', function () {

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

  describe('#syncTeam', function () {

    this.timeout(5000);

    it('should synchronize team members', function (done) {

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
          .then(() => sync.syncTeam('test-team'))
          .then(team => {
            assert.sameMembers(
              team.members.map(x => x.login),
              ['artems', 'd4rkr00t', 'mishanga', 'sbmaxx']
            );
          });
      }, {}, done);

    });

  });

});
