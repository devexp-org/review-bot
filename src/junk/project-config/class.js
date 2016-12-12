import _ from 'lodash';
import minimatch from 'minimatch';

export default class ProjectConfig {

  constrcutor(logger, github, teamDispatcher) {
    this.looger = logger;
    this.github = github;
    this.teamDispatcher = teamDispatcher;
  }

  /**
   * Get config from github
   *
   * @param {Object} pullRequest
   *
   * @return {Promise}
   */
  _getConfig(pullRequest) {
    const req = {
      user: pullRequest.owner,
      repo: pullRequest.repository.name,
      path: '.devexp.json'
    };

    return new Promise((resolve, reject) => {
      this.github.repos.getContent(req, (err, data) => {
        if (err) {
          const repo = pullRequest.repository.full_name;
          return reject(new Error(`Config not found for ${repo}`));
        }

        const config = JSON.parse(this._fromBase64(data.content));

        resolve(config);
      });
    });
  }

  _fromBase64(content) {
    return new Buffer(content, 'base64').toString('utf-8');
  }

  /**
   * Check files with pattern
   *
   * @param {Array} files
   * @param {String|Regex} pattern
   *
   * @return {Boolean}
   */
  _matchSome(files, pattern) {
    for (let i = 0; i < files.length; i++) {
      if (minimatch(files[i], pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get unavilable users
   *
   * @param {Object} review
   * @param {Array} members
   *
   * @return {Promise}
   */
  _getRequiredMembers(review, members) {
    const team = this.teamDispatcher.findTeamByPullRequest(review.pullRequest);

    const promise = _.map(members, (user) => {
      return team.findTeamMember(user)
        .then(user => {
          if (!user) {
            this.logger.warn(`There are no user with the login "@${user.login}" in team`);
            return;
          }

          return { rank: 0, login: user.login };
        });
    });

    return Promise.all(promise)
      .then(users => {
        review.members = review.members.concat(_.compact(users));

        return review;
      });
  }

}
