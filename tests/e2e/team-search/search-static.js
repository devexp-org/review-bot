import { merge, withApp, withInitial } from '../app';
import { withTeamSearch } from '../team-search';
import { withModelSuite } from '../model';

export function withTeamSearchStatic(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-search': {
          options: {
            drivers: {
              'static': 'team-search-static'
            },
            defaultDriver: 'static'
          },
          dependencies: [
            'team-search-static'
          ]
        },
        'team-search-static': {
          path: './src/services/team-search/search-static',
          dependencies: [
            'model'
          ]
        }
      }
    }, config);

    next(test, config, done);

  };

}

describe('services/team-search/search-static', function () {

  const test = withTeamSearchStatic(
    withTeamSearch(
      withModelSuite(
        withInitial(
          withApp
        )
      )
    )
  );

  describe('#findByLogin', function () {

    it('should find a user in the database', function (done) {

      test(imports => {
        const search = imports['team-search'];

        return search.findByLogin('test-user')
          .then(user => assert.equal(user.login, 'test-user'));
      }, {}, done);

    });

  });

});
