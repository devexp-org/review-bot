var _ = require('lodash');
var github = require('app/core/github/api');
var getSinceDate = require('app/core/github/utils/date').getSinceDate;

/**
 * Gets pull request files.
 *
 * @param {Object} pullRequest
 *
 * @returns {Promise}
 */
function getPullRequestFiles(pullRequest) {
    return new Promise(function (resolve, reject) {
        github.api.pullRequests.getFiles({
            user: pullRequest.org,
            repo: pullRequest.repo,
            number: pullRequest.number,
            per_page: 100
        }, function (err, files) {
            if (err) {
                reject(err);
                return;
            }

            resolve(files);
        });
    });
}

/**
 * Clean files if they match ignore pattern.
 *
 * @param {Array} ignore - patterns to ignore.
 * @param {Number} filesToCheck - number of files to keep for futher processing.
 *
 * @returns {Promise}
 */
function cleanFiles(ignore, filesToCheck) {
    return function (files) {
        return new Promise(function (resolve) {
            files = _(files).filter(function (file) {
                var keep = true;

                _.forEach(ignore, function (pattern) {
                    if (file.filename.match(pattern)) {
                        keep = false;

                        return false;
                    }
                });

                return keep;
            }).sample(filesToCheck).value();

            resolve(files);
        });
    };
}

/**
 * Gets last commits for files.
 *
 * @param {String} since - get commits which newer then since date.
 * @param {Number} commitsCount - number of commits to get.
 * @param {Object} pullRequest
 *
 * @returns {Promise}
 */
function getLastCommits(since, commitsCount, pullRequest) {
    return function (files) {
        return new Promise(function (resolve) {
            var promiseList = [];

            _.forEach(files, function (file) {
                var options = {
                    user: pullRequest.org,
                    repo: pullRequest.repo,
                    path: file.filename,
                    per_page: commitsCount
                };

                if (since) {
                    options.since = since;
                }

                promiseList.push(new Promise(function (res) {
                    github.api.repos.getCommits(options, function (err, commits) {
                        if (err) {
                            res([]);
                            return;
                        }

                        res(commits);
                    });
                }));
            });

            Promise
                .all(promiseList)
                .then(resolve);
        });
    };
}

/**
 * Process commits and find most commiters for changed files.
 *
 * @param {Array} commits
 *
 * @returns {Promise}
 */
function processCommits(commits) {
    commits = _.flatten(commits);

    var commiters = {};

    return new Promise(function (resolve) {
        _.forEach(commits, function (commit) {
            commiters[commit.author.login] = commiters[commit.author.login] + 1 || 1;
        });

        resolve(commiters);
    });
}

/**
 * Adds rank to most commiters.
 *
 * @param {Number} maxRank
 * @param {Array} team
 *
 * @returns {Array} team
 */
function addRank(maxRank, team) {
    return function (commiters) {
        return new Promise(function (resolve) {
            var max = 0;

            _.forIn(commiters, function (rank) {
                if (rank > max) max = rank;
            });

            _.forEach(team, function (member) {
                member.rank += (commiters[member.login] || 0) / max * maxRank;
            });

            resolve(team);
        });
    };
}

/**
 * Creates commiters processor for suggesting reviewrs.
 *
 * @param {Number} max - max rank for current step.
 * @param {Object} options
 * @param {Array} options.ignore - list of patterns to ignore.
 * @param {Number} options.filesToCheck - number files to get commits in.
 * @param {Numbers} options.commitsCount - number of commits to inspect.
 *
 * @returns {Function}
 */
module.exports = function commitersProcessorCreator(max, options) {
    /**
     * Commits processor adds rank for commiters in same files as current pull request.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function commitersProcessor(review) {
        return new Promise(function (resolve) {
            if (_.isEmpty(review.team)) {
                resolve(review);
            }

            getPullRequestFiles(review.pull)
                .then(cleanFiles(options.ignore, options.filesToCheck))
                .then(getLastCommits(getSinceDate(options.since), options.commitsCount, review.pull))
                .then(processCommits)
                .then(addRank(max, review.team))
                .then(function (team) {
                    review.team = team;

                    resolve(review);
                }, function () {
                    resolve(review);
                });
        });
    };
};
