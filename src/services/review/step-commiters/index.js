import _ from 'lodash';
import moment from 'moment';
import minimatch from 'minimatch';
import AbstractReviewStep from '../step';

export class CommitersReviewStep extends AbstractReviewStep {

  constructor(github, logger) {
    super();

    this.github = github;
    this.logger = logger;
  }

  /**
   * @override
   */
  config() {
    return {
      max: { type: 'number' },
      since: { type: 'string' },
      ignore: { type: ['string'] },
      commitsCount: { type: 'number' },
      filesToCheck: { type: 'number' }
    };
  }

  /**
   * Returns since date for github api.
   *
   * @param {Array.<String>} date - [2, 'days']
   *
   * @return {String}
   */
  getSinceDate(date) {
    if (!date) return '';

    return moment()
      .subtract(date[0], date[1] || 'days')
      .format('YYYY-MM-DDTHH:mm:ssZZ');
  }

  /**
   * Returns pull request files.
   *
   * @param {Object} pullRequest
   * @param {Array}  ignorePatterns - patterns to ignore.
   * @param {Number} filesToCheck - number of files to keep for futher processing.
   *
   * @return {Promise.<Array.<GitHubFile>>}
   */
  getFiles(pullRequest, ignorePatterns, filesToCheck = 5) {
    let files = pullRequest.get('files');

    if (_.isEmpty(files)) {
      return Promise.resolve([]);
    }

    files = _(files)
      .filter(file => {
        let keep = true;

        _.forEach(ignorePatterns, pattern => {
          if (minimatch(file.filename, pattern)) {
            keep = false;
          }
        });

        return keep;
      })
      .sampleSize(filesToCheck)
      .value();

    return Promise.resolve(files);
  }

  /**
   * Gets last commits of files.
   *
   * @param {Object} pullRequest
   * @param {String} since - get commits which newer then since date.
   * @param {Number} commitsCount - number of commits to get.
   *
   * @return {Promise.<Array>} [commit]
   */
  getCommits(pullRequest, since, commitsCount = 10) {
    const github = this.github;
    const logger = this.logger;

    return function (files) {
      const promise = [];

      const options = {
        repo: pullRequest.repository.name,
        owner: pullRequest.owner,
        per_page: commitsCount
      };

      if (since) {
        options.since = since;
      }

      _.forEach(files, file => {
        const req = _.assign({}, { path: file.filename }, options);

        promise.push(new Promise(resolve => {
          github.repos.getCommits(req, (error, commits) => {
            if (error) {
              commits = [];
              logger.error(error);
            }

            resolve(commits);
          });
        }));
      });

      return Promise.all(promise)
        .then(result => _.flatten(result));
    };

  }

  /**
   * Finds the most commiters for changed files.
   *
   * @param {Array} commits
   *
   * @return {Promise.<Array>} [{ author: number_of_commits }]
   */
  getCommiters(commits) {
    const commiters = {};

    _.forEach(commits, (commit) => {
      const author = commit.author;

      if (author) {
        commiters[author.login] = (commiters[author.login] || 0) + 1;
      }
    });

    return Promise.resolve(commiters);
  }

  /**
   * Add rank to the most commiters.
   *
   * @param {Number} maxRank
   * @param {Array}  members
   *
   * @return {Array} team
   */
  addRank(maxRank, members) {

    return function (commiters) {
      const maxCommits = _.max(_.values(commiters));

      return _.forEach(members, (reviewer) => {
        reviewer.rank += commiters[reviewer.login]
          ? maxRank / (maxCommits / commiters[reviewer.login])
          : 0;
      });
    };

  }

  /**
   * Adds rank for commiters in same files as current pull request.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Array}  [options.max]
   * @param {Array}  [options.since] - how old commits need to retrieve
   * @param {Array}  [options.ignore] - list of patterns to ignore.
   * @param {Number} [options.commitsCount] - number of commits to inspect.
   * @param {Number} [options.filesToCheck] - number files to get commits in.
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {
    const max = options.max;

    if (_.isEmpty(review.members)) {
      return Promise.resolve(review);
    }

    const sinceDate = this.getSinceDate(options.since);

    const members = review.members;
    const pullRequest = review.pullRequest;

    return this.getFiles(pullRequest, options.ignore, options.filesToCheck)
      .then(this.getCommits(pullRequest, sinceDate, options.commitsCount))
      .then(this.getCommiters)
      .then(this.addRank(max, members))
      .then(() => review);
  }

}

/**
 * Create review `commiters` step.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {AbstractReviewStep}
 */
export default function setup(options, imports) {

  const github = imports.github;
  const logger = imports.logger.getLogger('review.step.commiters');

  return new CommitersReviewStep(github, logger);

}
