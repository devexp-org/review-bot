var _ = require('lodash');
var github = require('app/core/github/api');
var getSinceDate = require('app/core/github/utils/date').getSinceDate;

/**
 * Returns pull reqest files.
 *
 * @param {Object} pullRequest
 * @param {Array} ignore - patterns to ignore.
 * @param {Number} filesToCheck - number of files to keep for futher processing.
 *
 * @returns {Array} files
 */
function getPullRequestFiles(pullRequest, ignore, filesToCheck) {
    var files = _.clone(pullRequest.get('files'));

    if (_.isEmpty(files)) {
        return Promise.resolve([]);
    }

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

    return Promise.resolve(files);
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
        var promiseList = [];
        var options = {
            user: pullRequest.org,
            repo: pullRequest.repo,
            per_page: commitsCount
        };

        if (since) {
            options.since = since;
        }

        _.forEach(files, function (file) {
            options.path = file.filename;

            promiseList.push(new Promise(function (resolve) {
                github.api.repos.getCommits(options, function (err, commits) {
                    if (err) {
                        resolve([]);
                    } else {
                        resolve(commits);
                    }
                });
            }));
        });

        return Promise.all(promiseList);
    };
}

/**
 * Process commits and find most commiters for changed files.
 *
 * @param {Array} commits
 *
 * @returns {Object} { author: number_of_commits }
 */
function processCommits(commits) {
    var commiters = {};

    commits = _.flatten(commits);

    _.forEach(commits, function (commit) {
        commiters[commit.author.login] = commiters[commit.author.login] + 1 || 1;
    });

    return commiters;
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
        var max = 0;

        _.forIn(commiters, function (rank) {
            if (rank > max) max = rank;
        });

        _.forEach(team, function (member) {
            member.rank += (commiters[member.login] || 0) / ((max * maxRank) || 1);
        });

        return team;
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
     * @param {Review} review
     *
     * @returns {Promise}
     */
    return function commitersProcessor(review) {
        if (_.isEmpty(review.team)) {
            return Promise.resolve(review);
        }

        return getPullRequestFiles(review.pull, options.ignore, options.filesToCheck)
            .then(getLastCommits(getSinceDate(options.since), options.commitsCount, review.pull))
            .then(processCommits)
            .then(addRank(max, review.team))
            .then(function (team) {
                review.team = team;

                return review;
            });
    };
};
