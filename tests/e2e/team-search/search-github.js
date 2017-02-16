import { merge, withApp, withInitial } from '../app';
import { withTeamSearch } from '../team-search';
import { withModelSuite } from '../model';
import { withGitHub } from '../github';

export function withTeamSearchGitHub(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-search': {
          options: {
            drivers: {
              github: 'team-search-github'
            },
            defaultDriver: 'github'
          },
          dependencies: [
            'team-search-github'
          ]
        },
        'team-search-github': {
          path: './src/services/team-search/search-github',
          dependencies: [
            'github'
          ]
        }
      }
    }, config);

    next(test, config, done);

  };

}

describe('services/team-search/search-github', function () {

  const test = withTeamSearchGitHub(
    withTeamSearch(
      withModelSuite(
        withGitHub(
          withInitial(
            withApp
          )
        )
      )
    )
  );

  describe('#findByLogin', function () {

    it('should find a user by using GitHub API', function (done) {

      test(imports => {
        const search = imports['team-search'];

        return search.findByLogin('octocat')
          .then(user => assert.equal(user.login, 'octocat'));
      }, {}, done);

    });

  });

});
