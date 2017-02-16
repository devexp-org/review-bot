import { merge, withApp, withInitial } from '../app';
import { withModel } from '../model/';
import { withTeamModel } from '../model/model-team';
import { withUserModel } from '../model/model-user';
import { withTeamSync } from '../team-sync';
import { withTeamSearch } from '../team-search';
import { withTeamManager } from '../team-manager';
import { withYandexStaff } from '../yandex-staff';
import { withTeamSearchGitHub } from '../team-search/search-github';

export function withTeamDriverYandexStaff(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-sync': {
          options: {
            drivers: {
              'yandex-staff': 'team-driver-yandex-staff'
            }
          },
          dependencies: [
            'team-driver-yandex-staff'
          ]
        },
        'team-driver-yandex-staff': {
          path: './src/services/team-sync/driver-yandex-staff',
          dependencies: [
            'yandex-staff'
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
              name: 'yandex-staff',
              options: { groupId: 1586 }
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

describe('services/team-sync/sync-yandex-staff', function () {

  const test = withTeamDriverYandexStaff(
    withTeamSync(
      withTeamSearchGitHub(
        withTeamSearch(
          withTeamManager(
            withTeamModel(
              withUserModel(
                withModel(
                  withYandexStaff(
                    withInitial(
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

    it('should get members using YandexStaff API', function (done) {

      test(imports => {
        const sync = imports['team-sync'];

        return sync.getTeamDriver('test-team')
          .then(teamDriver => teamDriver.getMembers())
          .then(candidates => {
            assert.sameMembers(
              candidates.map(x => x.login),
              [
                'xxxxxx',
                'boronchiev',
                'coffeeich',
                'nsobyanin',
                'jsus',
                'alexdivin',
                'vitoshnev',
                'off-border'
              ]
            );
          });
      }, {}, done);

    });

  });

});
