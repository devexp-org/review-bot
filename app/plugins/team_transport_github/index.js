var _ = require('lodash');
var github = require('app/core/github/api');

var Err = require('terror').create('app/plugins/team_transport_github', {
    TEAM_NOT_FOUND: 'Team %team% for organisation %org% not found.',
    NO_PARAMS: 'There is no required params: { org, [team] }',
    GITHUB_API_ERR: 'Github api error'
});

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
            if (err) return reject(Err.createError(Err.CODES.GITHUB_API_ERR, err));

            var repoTeam = _(res).filter({ slug: team }).first();

            if (!repoTeam) {
                return reject(Err.createError(Err.CODES.GITHUB_API_ERR, {
                    team: team,
                    org: org
                }));
            }

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
            if (err) return reject(Err.createError(Err.CODES.GITHUB_API_ERR, err));

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
function getOrgMembers(org) {
    return new Promise(function (resolve, reject) {
        github.api.orgs.getMembers({ org: org, per_page: 100 }, function (err, res) {
            if (err) return reject(Err.createError(Err.CODES.GITHUB_API_ERR, err));

            resolve(res);
        });
    });
}

/**
 * Gets team from github repo organization.
 *
 * @param {Object} params
 * @param {String} params.org - github organisation where team hosted.
 * @param {String} [params.team] - slug of team.
 *
 * @returns {Promise}
 */
module.exports = function teamTransportGithub(params) {
    if (!params || !params.org) return Promise.reject(Err.createError(Err.CODES.NO_PARAMS));

    if (!params.team) {
        return getOrgMembers(params.org);
    }

    return getTeamId(params.org, params.team)
        .then(getTeamMembers);
};
