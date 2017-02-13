import AbstractUserSearch from '../search-abstract';

export default class GitHubSearch extends AbstractUserSearch {

  constructor(github) {
    super();

    this.github = github;
  }

  toUser(user) {
    const result = {
      login: user.login,
      html_url: user.html_url,
      avatar_url: user.avatar_url,
      contacts: []
    };

    if (user.email) {
      result.contacts.push({ id: 'email', account: user.email });
    }

    return result;
  }

  /**
   * @override
   */
  findByLogin(login) {
    return this.findGitHubUser(login)
      .then(this.toUser.bind(this));
  }

  /**
   * Finds user by username on GitHub
   *
   * @protected
   *
   * @param {String} username
   *
   * @return {Object}
   */
  findGitHubUser(username) {
    return new Promise((resolve, reject) => {
      this.github.users.getForUser({ username }, (err, result) => {
        if (err) {
          reject(new Error('GitHub API: ' + err));
          return;
        }

        resolve(result);
      });
    });
  }

}
