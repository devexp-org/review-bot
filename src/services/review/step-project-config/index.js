import {
  map, uniq, find, remove, reject, includes, difference,
  isNull, forEach, sampleSize
} from 'lodash';
import minimatch from 'minimatch';
import AbstractReviewStep from '../step';

export class ProjectConfigReviewStep extends AbstractReviewStep {

  constructor(logger, github, teamManager) {
    super();

    this.logger = logger;
    this.github = github;
    this.teamManager = teamManager;
  }

  /**
   * @override
   */
  config() {
    return {
      configName: { type: 'string' }
    };
  }

  readConfig(pullRequest, configName) {
    return this
      .getConfig(pullRequest, configName)
      .then(config => this.applyRules(pullRequest, config));
  }

  /**
   * Get config from github
   *
   * @param {Object} pullRequest
   * @param {String} configName
   *
   * @return {Promise}
   */
  getConfig(pullRequest, configName = '.devexp.json') {

    const req = {
      owner: pullRequest.owner,
      repo: pullRequest.repository.name,
      path: configName
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

        resolve(JSON.parse(this.fromBase64(data.content)));
      });
    });

  }

  fromBase64(content) {
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
  applyRules(pullRequest, config) {

    const patch = {
      addMembers: [],
      removeMembers: [],
      addOnlySpecial: false
    };

    if (!config.specialReviewers) {
      return patch;
    }

    const files = map(pullRequest.files, 'filename');

    // Create patch from all rules
    forEach(config.specialReviewers, (rule) => {

      forEach(rule.pattern, (pattern) => {

        if (this.matchSome(files, pattern)) {

          const userCount = rule.membersToAdd || 1;
          const addOnlySpecial = Boolean(rule.doNotChooseOther);

          const addMembers = sampleSize((rule.addMembers || []), userCount);
          const removeMembers = (rule.removeMembers || []);

          patch.addMembers = patch.addMembers.concat(addMembers);
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
    patch.addMembers = difference(uniq(patch.addMembers), patch.removeMembers);
    patch.removeMembers = uniq(patch.removeMembers);

    return this.filterMembers(pullRequest, patch);

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
  filterMembers(pullRequest, patch) {

    return this.teamManager.findTeamByPullRequest(pullRequest)
      .then(team => {
        if (!team) {
          return Promise.reject(new Error(`Team not found for ${pullRequest}`));
        }

        const promise = map(
          patch.addMembers, (user) => {
            return team
              .findTeamMember(user)
              .then(found => found ? user : null);
          }
        );

        return Promise.all(promise)
          .then(users => {
            patch.addMembers = reject(users, isNull);
            return patch;
          });
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
  matchSome(files, pattern) {
    for (let i = 0; i < files.length; i++) {
      if (minimatch(files[i], pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Promote reviewers.
   *
   * @param {Review} review
   * @param {Array} toPromote
   *
   * @private
   */
  promote(review, toPromote) {
    forEach(toPromote, (login) => {
      const member = find(review.members, { login });

      if (member) {
        member.rank += 1000;
        member.special = true;
      } else {
        review.members.push({ login, rank: 1000, special: true });
      }
    });
  }

  /**
   * Exclude reviewers.
   *
   * @private
   *
   * @param {Review} review
   * @param {Array} toRemove
   */
  exclude(review, toRemove) {
    remove(review.members, (member) => includes(toRemove, member.login));
  }

  process(review, options) {
    return this.readConfig(review.pullRequest, options.configName)
      .then(patch => {
        this.logger.info('Add reviewers from config: %s', patch.addMembers);
        this.promote(review, patch.addMembers);

        this.logger.info('Remove reviewers from config: %s', patch.removeMembers);
        this.exclude(review, patch.removeMembers);

        review.addOnlySpecial = patch.addOnlySpecial;

        return Promise.resolve(review);
      });
  }

}

/**
 * Create review `project-config` step.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {AbstractReviewStep}
 */
export default function setup(options, imports) {
  const github = imports.github;
  const logger = imports.logger.getLogger('review.step.project-config');
  const teamManager = imports['team-manager'];

  return new ProjectConfigReviewStep(logger, github, teamManager, options);
}
