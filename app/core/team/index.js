var Err = require('terror').create('app/core/team', {
    NOT_FOUND: 'Team for repo "%repo%" not found.',
    NOT_TRANSPORT: 'Transport is required for getting team for "%repo%".'
});

module.exports = {
    /**
     * Init team module.
     *
     * @param {Object} options
     *
     * @returns {this}
     */
    init: function init(options) {
        this._options = options;

        return this;
    },

    /**
     * Loads team for given repo.
     *
     * @param {String} repo - repository full name org/repo.
     *
     * @returns {Promise}
     */
    get: function get(repo) {
        if (!this._options[repo]) return Promise.reject(
            Err.createError(Err.CODES.NOT_FOUND, { repo: repo })
        );

        if (!this._options[repo].transport) return Promise.reject(
            Err.createError(Err.CODES.NOT_TRANSPORT, { repo: repo })
        );

        return this._options[repo].transport(this._options[repo].params || {});
    },

    /**
     * Returns params for team which assigned to given repo.
     * Might be useful for storing some team related configuration.
     *
     * @param {String} repo - repository full name org/repo.
     *
     * @returns {Object}
     */
    getParams: function (repo) {
        if (!this._options[repo]) throw Err.createError(Err.CODES.NOT_FOUND, { repo: repo });

        return this._options[repo].params || {};
    }
};

/**
 * Team.
 *
 * @typedef {Array<Member>} Team
 */

 /**
  * Member.
  *
  * @typedef {Object} Member
  * @property {String} login
  * @property {String} avatar_url
  * @property {String} html_url
  */
