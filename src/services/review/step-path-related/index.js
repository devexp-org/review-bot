import _ from 'lodash';
import minimatch from 'minimatch';
import AbstractReviewStep from '../step';

export class PathRelatedReviewStep extends AbstractReviewStep
{

  /**
   * @override
   */
  config() {
    return {
      max: {
        type: 'number'
      },
      members: {
        type: ['string']
      },
      incPattern: {
        type: ['string']
      },
      decPattern: {
        type: ['string']
      }
    };
  }

  /**
   * Checks if files match any pattern.
   *
   * @param {String[]} files - list of files
   * @param {String[]} patterns - minimatch compitable pattern
   *
   * @return {Boolean}
   */
  isMatchAny(files, patterns) {
    return _.some(_.map(patterns, (pattern) => {
      return !_.isEmpty(minimatch.match(files, pattern));
    }));
  }

  /**
   * Checks if files matches all patterns.
   *
   * @param {String[]} files - list of files
   * @param {String[]} patterns - minimatch compitable pattern
   *
   * @return {Boolean}
   */
  isMatchAll(files, patterns) {
    return _.every(_.map(patterns, (pattern) => {
      return !_.isEmpty(minimatch.match(files, pattern));
    }));
  }

  /**
   * Gets files from pull request
   *
   * @param {Object} pullRequest
   *
   * @return {Promise.<Array>}
   */
  getFiles(pullRequest) {
    const files = pullRequest.get('files');

    if (_.isEmpty(files)) {
      return Promise.reject(new Error('No files in pull request'));
    }

    return Promise.resolve(_.map(files, 'filename'));
  }

  /**
   * Increment rank for random member if files match the pattern
   *
   * @param {Object} review
   * @param {Object} options - inc options
   *
   * @return {Promise.<Array>}
   */
  incRank(review, options) {

    return (files) => {
      const { max, pattern, members } = options;
      // TODO config: membersCount
      const membersCount = Math.floor(Math.random() * members.length) + 1;
      const isApplicable =
        !_.isEmpty(pattern) &&
        !_.isEmpty(review.members) &&
        this.isMatchAny(files, pattern);

      let selected = [];

      if (isApplicable) {
        for (let i = 0; _.isEmpty(selected) && i < 5; i++) {
          const selectedMembers = _.sample(members, membersCount);

          selected = _.filter(review.members, (user) => {
            return selectedMembers.indexOf(user.login) !== -1;
          });
        }

        selected.forEach(user => {
          user.rank += Math.floor(Math.random() * max) + 1;
        });

      }

      return Promise.resolve(review);
    };

  }

  /**
   * Decrement rank for all members from options if pattern matches files
   *
   * @param {Object} review
   * @param {Object} options
   *
   * @return {Promise.<Array>}
   */
  decRank(review, options) {

    return (files) => {
      const { max, pattern, members } = options;
      const isApplicable = this.isMatchAll(files, pattern);

      if (isApplicable) {
        review.members
          .filter(member => members.indexOf(member.login) !== -1)
          .forEach(member => {
            member.rank -= Math.floor(Math.random() * max) + 1;
          });
      }

      return Promise.resolve(review);
    };

  }

  /**
   * Adds rank for members who are defined in `incPattern`.
   * Subtracts rank for members who are defined in `decPattern`.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {

    return this.getFiles(review.pullRequest)
      .then(files => {
        const inc = Promise.resolve(files)
          .then(this.incRank(review, _.assign({}, options, { pattern: options.incPattern })));
        const dec = Promise.resolve(files)
          .then(this.decRank(review, _.assign({}, options, { pattern: options.decPattern })));

        return Promise.all([inc, dec]).then(() => review);
      });

  }

}

/**
 * Create review `path-related` step.
 *
 * @return {AbstractReviewStep}
 */
export default function setup() {
  return new PathRelatedReviewStep();
}
