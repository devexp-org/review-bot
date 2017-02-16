import { merge, withApp, withInitial } from '../app';
import { withModel } from '../model/';
import { withGitHub } from '../github';
import { withTeamModel } from '../model/model-team';
import { withUserModel } from '../model/model-user';
import { withTeamSync } from '../team-sync';
import { withTeamSearch } from '../team-search';
import { withTeamManager } from '../team-manager';
import { withTeamSearchGitHub } from '../team-search/search-github';

export function withTeamDriverStatic(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-sync': {
          options: {
            drivers: {
              'static': 'team-driver-static'
            }
          },
          dependencies: [
            'team-driver-static'
          ]
        },
        'team-driver-static': {
          path: './src/services/team-sync/driver-static',
          dependencies: [
            'model'
          ]
        }
      }
    }, config);

    next(imports => {
      const TeamModel = imports.TeamModel;

      return TeamModel.findByName('test-team')
        .then(team => {
          team.set({
            driver: { name: 'static' }
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

describe('services/team-sync/sync-static', function () {

  const test = withTeamDriverStatic(
    withTeamSync(
      withTeamSearchGitHub(
        withTeamSearch(
          withTeamManager(
            withTeamModel(
              withUserModel(
                withModel(
                  withInitial(
                    withGitHub(
                      withApp
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );

  describe('#getMembers', function () {

    it('should get members from database', function (done) {

      test(imports => {
        const sync = imports['team-sync'];

        return sync.getTeamDriver('test-team')
          .then(teamDriver => teamDriver.getMembers())
          .then(candidates => {
            assert.sameMembers(candidates.map(x => x.login), ['foo', 'bar']);
          });
      }, {}, done);

    });

  });

});
