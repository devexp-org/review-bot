export default function reviewSortCretor() {
    /**
     * Sorts reviewers by rank.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewSort(review) {
        return new Promise((resolve) => {
            review.team = review.team.sort((a, b) => {
                if (a.rank > b.rank) return -1;
                if (b.rank > a.rank) return 1;
                return 0;
            });

            resolve(review);
        });
    };
}
