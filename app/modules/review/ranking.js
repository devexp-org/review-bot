import Terror from 'terror';

const Err = Terror.create('app/modules/review/ranking', {
    NO_PROCESSORS: 'At least 1 processors should be added.'
});

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
    get() {
        return this.rankingProcessorsList;
    }
};
