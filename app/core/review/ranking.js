var Err = require('terror').create('app/core/review/ranking', {
    NO_PROCESSORS: 'At least 1 processors should be added.'
});

module.exports = {
    rankingProcessorsList: [],

    /**
     * Register reducer for ranking reviewers.
     *
     * @param {Object} options
     * @param {Function[]} options.processors — function which returns promise which resolve with { pull, team } object.
     *
     * @returns {this}
     */
    init: function init(options) {
        if (!options.processors) {
            throw Err.createError(Err.CODES.NO_PROCESSORS);
        }

        this.rankingProcessorsList = options.processors;

        return this;
    },

    /**
     * Returns registred processors list for futher using.
     *
     * @returns {Function[]}
     */
    get: function get() {
        return this.rankingProcessorsList;
    }
};
