'use strict';

import _ from 'lodash';
import moment from 'moment';

/**
 * Return pull reqest files.
 *
 * @param {Object} pullRequest
 * @param {Number} filesToCheck - number of files to keep for futher processing.
 * @param {Array}  ignore - patterns to ignore.
 *
 * @return {Promise}
 */
function getFiles(pullRequest, filesToCheck, ignore) {
  let files = pullRequest.get('files');

  if (_.isEmpty(files)) {
    return Promise.resolve([]);
  }

  files = _(files)
    .filter(file => {
      let keep = true;
      _.forEach(ignore, pattern => {
        // TODO use minimatch
        if (file.filename.match(pattern)) {
          keep = false;
        }
      });

      return keep;
    })
    .sample(filesToCheck)
    .value();

  return Promise.resolve(files);
}

/**
 * Get last commits for files.
 *
 * @param {Object} github
 * @param {Object} pullRequest
 * @param {String} since - get commits which newer then since date.
 * @param {Number} commitsCount - number of commits to get.
 *
 * @return {Promise}
 */
function getCommits(github, pullRequest, since, commitsCount) {

  return function (files) {
    const promise = [];

    const options = {
      repo: pullRequest.repository.name,
      user: pullRequest.organization.login,
      per_page: commitsCount
    };

    if (since) {
      options.since = since;
    }

    _.forEach(files, file => {
      options.path = file.filename;

      promise.push(new Promise(resolve => {
        github.repos.getCommits(options, (error, commits) => {
          error ? resolve([]) : resolve(commits);
        });
      }));
    });

    return Promise.all(promise);
  };

}

/**
 * Process commits and find most commiters for changed files.
 *
 * @param {Array} commits
 *
 * @return {Promise} { author: number_of_commits }
 */
function getCommiters(commits) {
  const members = {};

  _.forEach(_.flatten(commits), (commit) => {
    members[commit.author.login] = members[commit.author.login] + 1 || 1;
  });

  return Promise.resolve(members);
}

/**
 * Add rank to most commiters.
 *
 * @param {Number} maxRank
 * @param {Array}  team
 *
 * @return {Array} team
 */
function addRank(maxRank, team) {
  return function (members) {
    let max = 0;

    _.forIn(members, (rank) => {
      if (rank > max) {
        max = rank;
      }
    });

    _.forEach(team, (member) => {
      member.rank += (members[member.login] || 0) / ((max * maxRank) || 1);
    });

    return team;
  };
}

/**
 * Return since date for github api.
 *
 * @param {Array<String>} date - [2, 'days']
 *
 * @return {String} [description]
 */
function getSinceDate(date) {
  if (!date) return '';

  return moment()
    .subtract(date[0], date[1] || 'days')
    .format('YYYY-MM-DDTHH:MM:SSZ');
}

/**
 * Create review `commiters` processor.
 *
 * @param {Object} options
 * @param {Number} options.max - max rank for current step.
 * @param {Array}  options.ignore - list of patterns to ignore.
 * @param {Number} options.commitsCount - number of commits to inspect.
 * @param {Number} options.filesToCheck - number files to get commits in.
 *
 * @return {Function}
 */
export default function commiters(options) {

  const max = options.max;

  /**
   * Add rank for commiters in same files as current pull request.
   *
   * @param {Review} review
   * @param {Object} payload
   *
   * @return {Promise}
   */
  return function commitersStep(review, payload) {

    if (_.isEmpty(review.team)) {
      return Promise.resolve(review);
    }

    const github = payload.github;
    const sinceDate = getSinceDate(options.since);
    const pullRequest = review.pullRequest;

    return getFiles(pullRequest, options.ignore, options.filesToCheck)
      .then(getCommits(github, pullRequest, sinceDate, options.commitsCount))
      .then(getCommiters)
      .then(addRank(max, review.team))
      .then(team => {
        review.team = team;

        return review;
      });

  };

}
