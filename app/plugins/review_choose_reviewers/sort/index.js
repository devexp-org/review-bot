module.exports = function reviewSortCreator() {
    /**
     * Sorts reviewers by rank.
     *
     * @param {Review} review
     *
     * @returns {Review} review
     */
    return function reviewSort(review) {
        review.team = review.team.sort(function (a, b) {
            if (a.rank > b.rank) return -1;
            if (b.rank > a.rank) return 1;
            return 0;
        });

        return review;
    };
};
