import { merge, withApp, withInitial } from '../app';
import { withYandexStaff } from '../yandex-staff';
import { withTeamSearch } from '../team-search';
import { withModelSuite } from '../model';

export function withTeamSearchYandexStaff(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-search': {
          options: {
            drivers: {
              'yandex-staff': 'team-search-yandex-staff'
            },
            defaultDriver: 'yandex-staff'
          },
          dependencies: [
            'team-search-yandex-staff'
          ]
        },
        'team-search-yandex-staff': {
          path: './src/services/team-search/search-yandex-staff',
          dependencies: [
            'yandex-staff'
          ]
        }
      }
    }, config);

    next(test, config, done);

  };

}

describe('services/team-search/search-yandex-staff', function () {

  const test = withTeamSearchYandexStaff(
    withTeamSearch(
      withModelSuite(
        withYandexStaff(
          withInitial(
            withApp
          )
        )
      )
    )
  );

  describe('#findByLogin', function () {

    it('should find a user by using YandexStaff API', function (done) {

      test(imports => {
        const search = imports['team-search'];

        return search.findByLogin('volozh')
          .then(user => assert.equal(user.login, 'volozh'));
      }, {}, done);

    });

  });

});
