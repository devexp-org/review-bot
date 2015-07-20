module.exports = function reviewRemoveAuthorCreator() {

    /**
     * Removes pull author from team.
     *
     * @param {Review} review
     *
     * @returns {Review} review
     */
    return function reviewRemoveAuthor(review) {
        var pullAuthor = review.pull.user.login;

        review.team = review.team.filter(function (item) {
            return item.login !== pullAuthor;
        });

        return Promise.resolve(review);
    };
};
