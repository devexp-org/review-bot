import _ from 'lodash';

/**
 * Creates review simple team processor.
 *
 * @param {Object} team
 *
 * @returns {Function}
 */
export default function reviewSimpleTeamCreator(team) {
    /**
     * Adds team to review fom simple config.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewSimpleTeam(review) {
        return new Promise((resolve, reject) => {
            var repo = review.pull.head.repo.full_name,
                teamName = team.repoToTeam[repo];

            if (teamName && team.teams[teamName]) {
                review.team = _.clone(team.teams[teamName], true);

                resolve(review);
            } else {
                reject(`Team for repo: ${repo} not found!`);
            }
        });
    };
}
