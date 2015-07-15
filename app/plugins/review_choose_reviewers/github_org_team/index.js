var _ = require('lodash');
var github = require('app/core/github/api');

/**
 * Gets github team id from org name and team name.
 *
 * @param {String} org - Github organisation name
 * @param {String} team - Github organization's team name (slug).
 *
 * @returns {Promise}
 */
function getTeamId(org, team) {
    return new Promise(function (resolve, reject) {
        github.api.orgs.getTeams({ org: org, per_page: 100 }, function (err, res) {
            if (err) {
                reject(err);
                return;
            }

            var repoTeam = _(res).filter({ slug: team }).first();

            if (!repoTeam) reject('Team ' + team + ' for org ' + org + ' not found.');

            resolve(repoTeam.id);
        });
    });
}

/**
 * Gets list of team members by team id.
 *
 * @param {Number} id - team id
 *
 * @returns {Promise}
 */
function getTeamMembers(id) {
    return new Promise(function (resolve, reject) {
        github.api.orgs.getTeamMembers({ id: id, per_page: 100 }, function (err, res) {
            if (err) {
                reject(err);
                return;
            }

            resolve(res);
        });
    });
}

/**
 * Get organisation members.
 *
 * @param {String} org
 *
 * @returns {Promise}
 */
function getOrgsMembers(org) {
    return new Promise(function (resolve, reject) {
        github.api.orgs.getMembers({ org: org, per_page: 100 }, function (err, res) {
            if (err) {
                reject(err);
                return;
            }

            resolve(res);
        });
    });
}

/**
 * Remove members which are in ignore list.
 *
 * @param {Array} ignore
 *
 * @returns {Array}
 */
function cleanMembers(ignore) {
    return function (members) {
        return _.reject(members, function (member) {
            return _.includes(ignore, member.login);
        });
    };
}

/**
 * Adds rank property to every team member.
 *
 * @param {Array} team
 *
 * @returns {Array}
 */
function addRank(team) {
    return team.map(function (member) {
        member.rank = 0;

        return member;
    });
}

module.exports = function reviewGithubOrgTeamCreator(options) {
    /**
     * Gets team for review from github repo organization.
     *
     * @param {Review} review
     *
     * @returns {Promise}
     */
    return function reviewGithubOrgTeam(review) {
        var opts = options[review.pull.full_name];
        var promise;

        if (!opts) return Promise.reject('There is no team for repo: ' + review.pull.full_name);

        if (!opts.team) {
            promise = getOrgsMembers(opts.org)
                .then(cleanMembers(opts.ignore || []))
                .then(addRank);
        } else {
            promise = getTeamId(opts.org, opts.team)
                .then(getTeamMembers)
                .then(addRank);
        }

        promise = promise.then(function (team) {
            review.team = team;

            return review;
        });

        return promise;
    };
};
