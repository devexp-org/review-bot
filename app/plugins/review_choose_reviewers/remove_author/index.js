export default function reviewRemoveAuthorCreator() {
    /**
     * Removes pull author from team.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewRemoveAuthor(review) {
        return new Promise((resolve) => {
            var pullAuthor = review.pull.user.login;

            review.team = review.team.filter((item) => {
                return item.login !== pullAuthor;
            });

            resolve(review);
        });
    };
}
