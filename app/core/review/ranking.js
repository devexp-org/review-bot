export default {
    rankingProcessorsList: [],

    /**
     * Register reducer for ranking reviewers.
     *
     * @param {Object} options
     * @param {Function[]} options.processors — function which returns promise which resolve with { pull, team } object.
     *
     * @returns {this}
     */
    init(options) {
        if (!options.processors) {
            throw new Error('At least 1 processors should be added.');
        }

        this.rankingProcessorsList = options.processors;

        return this;
    },

    /**
     * Returns registred processors list for futher using.
     *
     * @returns {Function[]}
     */
    get() {
        return this.rankingProcessorsList;
    }
};
