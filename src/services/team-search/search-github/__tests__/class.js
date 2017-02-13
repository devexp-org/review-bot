import GitHubSearch from '../class';

import githubMock from '../../../github/__mocks__/';

describe('services/team-search/search-github/class', function () {

  let github, search;

  beforeEach(function () {
    github = githubMock();

    search = new GitHubSearch(github);
  });

  describe('#findByLogin', function () {

    it('should use method `getForUser` to obtain a user', function (done) {
      github.users.getForUser
        .callsArgWith(1, null, { login: 'octocat' });

      search.findByLogin('octocat')
        .then(() => assert.calledWith(
          github.users.getForUser,
          sinon.match({ username: 'octocat' })
        ))
        .then(done, done);
    });

    it('should return user with contacts if they exist', function (done) {
      github.users.getForUser
        .callsArgWith(1, null, { login: 'octocat', email: 'octocat@github.com' });

      search.findByLogin('octocat')
        .then(user => assert.deepEqual(
          user.contacts,
          [{ id: 'email', account: 'octocat@github.com' }]
        ))
        .then(done, done);
    });

    it('should rejected promise if github return an error', function (done) {
      github.users.getForUser
        .callsArgWith(1, new Error('just error'));

      search.findByLogin('octocat')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

  });

});
