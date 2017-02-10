export default class GitHubSearch {

  constructor(github) {
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

  findUser(username) {
    return this.findGitHubUser(username)
      .then(this.toUser.bind(this));
  }

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
