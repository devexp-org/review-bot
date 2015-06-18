export default {
    rankingReducersList: [],

    /**
     * Register reducer for ranking reviewers
     *
     * @param {Object} options
     * @param {Function[]} optins.reducers — function which returns promise which resolve with { pull, team } object
     *
     * @returns {this}
     */
    init(options) {
        if (!options.reducers) {
            throw new Error('At least 1 reducer should be added.');
        }

        this.rankingReducersList = options.reducers;

        return this;
    },

    /**
     * Returns registred reducers for futher using
     *
     * @returns {Function[]}
     */
    get() {
        return this.rankingReducersList;
    }
};
