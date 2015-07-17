var _ = require('lodash');

/**
 * Creates review simple team processor.
 *
 * @param {Object} team
 *
 * @returns {Function}
 */
module.exports = function reviewSimpleTeamCreator(team) {
    /**
     * Adds team to review fom simple config.
     *
     * @param {Review} review
     *
     * @returns {Review|Promise} review
     */
    return function reviewSimpleTeam(review) {
        var repo = review.pull.full_name;
        var teamName = team.repoToTeam[repo];

        if (teamName && team.teams[teamName]) {
            review.team = _.clone(team.teams[teamName], true).map(function (member) {
                member.rank = 0;

                return member;
            });

            return Promise.resolve(review);
        }

        return Promise.reject('There is no team for repo: ' + repo);
    };
};
