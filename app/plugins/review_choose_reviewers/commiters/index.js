var _ = require('lodash');
var github = require('app/core/github/api');

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

function getLastCommits(commitsCount, pullRequest) {
    return function (files) {
        return new Promise(function (resolve) {
            var promiseList = [];

            _.forEach(files, function (file) {
                promiseList.push(new Promise(function (res) {
                    github.api.repos.getCommits({
                        user: pullRequest.org,
                        repo: pullRequest.repo,
                        path: file.filename,
                        per_page: commitsCount
                    }, function (err, commits) {
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

function processCommits(commits) {
    commits = _.flatten(commits);

    var commiters = {};

    return new Promise(function (resolve) {
        _.forEach(commits, function (commit) {
            commiters[commit.author.login] = commiters[commit.author.login] + 1 || 1;
        });

        console.log(commiters);

        resolve(commiters);
    });
}

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

module.exports = function commitersProcessorCreator(max, options) {
    return function commitersProcessor(review) {
        return new Promise(function (resolve) {
            if (_.isEmpty(review.team)) {
                resolve(review);
            }

            getPullRequestFiles(review.pull)
                .then(cleanFiles(options.ignore, options.filesToCheck))
                .then(getLastCommits(options.commitsCount, review.pull))
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
