import _ from 'lodash';
import minimatch from 'minimatch';

/**
 * Checks if files match any pattern.
 *
 * @param {String[]} files - list of files
 * @param {String[]} patterns - minimatch compitable pattern
 *
 * @return {Boolean}
 */
export function isMatchAny(files, patterns) {
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
export function isMatchAll(files, patterns) {
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
export function getFiles(pullRequest) {
  const files = pullRequest.get('files');

  if (_.isEmpty(files)) {
    return Promise.reject(new Error('No files in pull request'));
  }

  return Promise.resolve(_.map(files, 'filename'));
}

/**
 * Increment rank for random member if files match the pattern
 *
 * @param {Object} options - inc options
 * @param {Object} review
 *
 * @return {Promise.<Array>}
 */
export function incRank(options, review) {

  return function (files) {
    const { max, pattern, members } = options;
    const membersCount = Math.floor(Math.random() * members.length) + 1;
    const isApplicable =
      !_.isEmpty(pattern) &&
      !_.isEmpty(review.members) &&
      isMatchAny(files, pattern);

    let reviewers = [];

    if (isApplicable) {
      for (let i = 0; _.isEmpty(reviewers) && i < 5; i++) {
        const selectedMembers = _.sample(members, membersCount);

        reviewers = _.filter(review.members, (reviewer) => {
          return selectedMembers.indexOf(reviewer.login) !== -1;
        });
      }

      const rank = Math.floor(Math.random() * max) + 1;

      reviewers = _.map(reviewers, (reviewer) => {
        return { login: reviewer.login, rank };
      });
    }

    return Promise.resolve(reviewers);
  };

}

/**
 * Decrement rank for all members from options if pattern matches files
 *
 * @param {Object} options
 * @param {Object} review
 *
 * @return {Promise.<Array>}
 */
export function decRank(options, review) {

  return function (files) {
    const { max, pattern, members } = options;
    const isApplicable = isMatchAll(files, pattern);

    let reviewers = [];

    if (isApplicable) {
      reviewers = _.chain(review.members)
        .filter(reviewer => members.indexOf(reviewer.login) !== -1)
        .map(reviewer => {
          const rank = -(Math.floor(Math.random() * max) + 1);

          return { login: reviewer.login, rank };
        })
        .value();
    }

    return Promise.resolve(reviewers);
  };

}

/**
 * Adds rank for members who are defined in `incPattern`.
 * Subtracts rank for members who are defined in `decPattern`.
 *
 * @param {Review} review
 * @param {Object} options
 *
 * @return {Promise.<Review>}
 */
export function pathRelated(review, options) {
  return getFiles(review.pullRequest)
    .then(files => {
      const inc = Promise.resolve(files)
        .then(incRank(_.assign({}, options, { pattern: options.incPattern }), review));
      const dec = Promise.resolve(files)
        .then(decRank(_.assign({}, options, { pattern: options.decPattern }), review));

      return Promise.all([inc, dec])
        .then(([inc, dec]) => [].concat(inc, dec));
    });
}

/**
 * Create review `path_related` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return pathRelated;
}
