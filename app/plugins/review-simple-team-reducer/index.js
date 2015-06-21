export default function reviewSimpleTeamReducer(team) {
    return function (review) {
        return new Promise(function (resolve, reject) {
            var repo = review.pull.head.repo.full_name,
                teamName = team.repoToTeam[repo];

            if (teamName && team.teams[teamName]) {
                review.team = team.teams[teamName];

                resolve(review);
            } else {
                reject(`Team for repo: ${repo} not found!`);
            }
        });
    };
}
