import minimatch from 'minimatch';
import { assign, sample, isEmpty, filter, forEach, any, map, all } from 'lodash';

/**
 * Checks if files match the pattern
 *
 * @param {String[]} files - list of files
 * @param {String[]} patterns - minimatch compitable pattern
 *
 * @return {Boolean}
 */
export function isMatch(files, patterns) {
  return any(map(patterns, pattern => !isEmpty(minimatch.match(files, pattern))));
}

/**
 * Checks if files matches all patterns
 *
 * @param {String[]} files - list of files
 * @param {String[]} patterns - minimatch compitable pattern
 *
 * @return {Boolean}
 */
export function isMatchAll(files, patterns) {
  return all(map(patterns, pattern => !isEmpty(minimatch.match(files, pattern))));
}

/**
 * Gets files from pull request
 *
 * @param {Object} pullRequest
 *
 * @return {Promise}
 */
export function getFiles(pullRequest) {
  const files = pullRequest.get('files');

  if (isEmpty(files)) return Promise.reject(new Error('No files in pull request'));

  return Promise.resolve(files);
}

/**
 * Increment rank for random member if files match the pattern
 *
 * @param {Object} options - inc options
 * @param {Object} review
 *
 * @return {Promise}
 */
export function incRank(options, review) {
  return function (files) {
    const { pattern, max, members } = options;
    const isApplicable = options && !isEmpty(pattern) && isMatch(files, pattern);
    const membersCount = Math.floor(Math.random() * members.length) + 1;

    if (isApplicable) {
      let reviewers = [];
      while (isEmpty(reviewers)) {
        const selectedMembers = sample(members, membersCount);

        reviewers = filter(
          review.reviewers,
          reviewer => selectedMembers.indexOf(reviewer.login) !== -1 // eslint-disable-line
        );
      }

      reviewers.forEach(reviewer => reviewer.rank += Math.floor(Math.random() * max) + 1);
    }

    return Promise.resolve(files);
  };
}

/**
 * Decrement rank for all members from options if pattern matches files
 *
 * @param {Object} options
 * @param {Object} review
 *
 * @return {Promise}
 */
export function decRank(options, review) {
  return function (files) {
    const { pattern, max, members } = options;
    const isApplicable = options && isMatchAll(files, pattern);
    const rank = Math.floor(Math.random() * (max - 1 + 1)) + 1;

    if (isApplicable) {
      forEach(review.reviewers, reviewer => {
        if (members.indexOf(reviewer.login) !== -1) {
          reviewer.rank -= rank;
        }
      });
    }

    return Promise.resolve(files);
  };
}

/**
 * Creates path related step for choose reviewers service.
 *
 * @param {Object} options
 *
 * @return {Function}
 */
export function pathRelatedCreator(options) {
  return function pathRelated(review) {
    return getFiles(review.pullRequest)
      .then(incRank(assign({}, options, { pattern: options.incPattern }), review))
      .then(decRank(assign({}, options, { pattern: options.decPattern }), review))
      .catch(() => review)
      .then(() => review);
  };
}

/**
 * @param {Object} options
 *
 * @return {Promise}
 */
export default function pathRelatedService(options) {
  const pathRelated = pathRelatedCreator(options);

  return Promise.resolve({ service: pathRelated });
}
