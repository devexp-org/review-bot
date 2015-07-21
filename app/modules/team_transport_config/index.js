var Err = require('terror').create('app/modules/team_transport_github', {
    NO_PARAMS: 'There is no team in params.'
});

/**
 * Gets team from config.
 *
 * @param {Object} params
 * @param {Array} params.team - github organisation where team hosted.
 *
 * @returns {Promise}
 */
module.exports = function teamTransportGithub(params) {
    if (!params || !params.team) return Promise.reject(Err.createError(Err.CODES.NO_PARAMS));

    return Promise.resolve(params.team);
};
