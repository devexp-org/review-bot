import _ from 'lodash';
import minimatch from 'minimatch';

export default class ProjectConfig {

  constructor(logger, github, teamManager, options) {
    this.logger = logger;
    this.github = github;
    this.teamManager = teamManager;

    this._configName = (options && options.configName) || '.devexp.json';
  }

  process(pullRequest) {
    return this.readConfig(pullRequest)
      .then(patch => {
        this.logger.info('Add reviewers from config: %s', patch.addMembers);
        const promoted = this._promoteReviewers(patch.addMembers);

        this.logger.info('Remove reviewers from config: %s', patch.removeMembers);
        const excluded = this._excludeReviewers(patch.removeMembers);

        return [].concat(promoted, excluded);
      });
  }

  readConfig(pullRequest) {
    return this
      ._getConfig(pullRequest)
      .then(config => this._applyRules(pullRequest, config));
  }

  /**
   * Promote reviewers.
   *
   * @param {Array} toPromote
   *
   * @private
   *
   * @return {Array}
   */
  _promoteReviewers(toPromote) {
    return toPromote
      .map(user => {
        return { login: user.login, rank: 1000, special: true };
      });
  }

  /**
   * Exclude reviewers.
   *
   * @private
   *
   * @param {Array} toRemove
   *
   * @return {Promise}
   */
  _excludeReviewers(toRemove) {
    return toRemove
      .map(user => {
        return { login: user.login, rank: -1000 };
      });
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
      path: this._configName
    };

    return new Promise((resolve, reject) => {
      this.github.repos.getContent(req, (err, data) => {
        if (err) {
          this.logger.warn(
            'Cannot find confing for %s',
            pullRequest.get('repository.full_name')
          );
          this.logger.error(err);

          return resolve({});
        }

        resolve(JSON.parse(this._fromBase64(data.content)));
      });
    });

  }

  _fromBase64(content) {
    return new Buffer(content, 'base64').toString('utf-8');
  }

  /**
   * Apply rules from config
   *
   * @private
   *
   * @param {Object} pullRequest
   * @param {Object} config
   *
   * @return {Promise}
   */
  _applyRules(pullRequest, config) {

    const patch = {
      addMembers: [],
      removeMembers: [],
      addOnlySpecial: false
    };

    if (!config.specialReviewers) {
      return patch;
    }

    const files = _.map(pullRequest.files, 'filename');

    // Create patch from all rules
    _.forEach(config.specialReviewers, (rule) => {

      _.forEach(rule.pattern, (pattern) => {

        if (this._matchSome(files, pattern)) {

          const userCount = rule.membersToAdd || 1;
          const addOnlySpecial = Boolean(rule.doNotChooseOther);

          const addMembers = _.sampleSize((rule.addMembers || []), userCount)
            .map(login => { return { login, pattern }; });

          patch.addMembers = patch.addMembers.concat(addMembers);

          const removeMembers = (rule.removeMembers || [])
            .map(login => { return { login, pattern }; });

          patch.removeMembers = patch.removeMembers.concat(removeMembers);

          if (addOnlySpecial) {
            patch.addOnlySpecial = true;
          }

          // break for lodash forEach
          return false;

        }

      });

    });

    // Remove unnecessary users
    patch.addMembers = _.differenceBy(
      _.uniqBy(patch.addMembers, 'login'),
      patch.removeMembers,
      'login'
    );

    patch.removeMembers = _.uniqBy(patch.removeMembers, 'login');

    return this._filterMembers(pullRequest, patch);

  }

  /**
   * Filter out non-existent reviewers.
   *
   * @private
   *
   * @param {Object} pullRequest
   * @param {Object} patch
   *
   * @return {Promise}
   */
  _filterMembers(pullRequest, patch) {

    const team = this.teamManager.findTeamByPullRequest(pullRequest);
    if (!team) {
      return Promise.reject(new Error(`Team not found for ${pullRequest}`));
    }

    const promise = _.map(
      patch.addMembers, (user) => {
        return team
          .findTeamMember(user.login)
          .then(found => found ? user : null);
      }
    );

    return Promise.all(promise)
      .then(users => {
        patch.addMembers = _.reject(users, _.isNull);

        return patch;
      });

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

}
