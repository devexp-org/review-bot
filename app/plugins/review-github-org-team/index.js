import _ from 'lodash';
import { github } from 'app/core/github/api';

function getTeamId(org, team) {
    return new Promise(function (resolve, reject) {
        github.orgs.getTeams({ org, per_page: 100 }, function (err, res) {
            if (err) reject(err);

            var repoTeam = _(res).filter({ slug: team }).first();

            if (!repoTeam) reject(`Team ${team} for org ${org} not found.`);

            resolve(repoTeam.id);
        });
    });
}

function getTeamMembers(id) {
    return new Promise(function (resolve, reject) {
        github.orgs.getTeamMembers({ id, per_page: 100 }, function (err, res) {
            if (err) reject(err);

            resolve(res);
        });
    });
}

function addRank(team) {
    return team.map((member) => {
        member.rank = 0;

        return member;
    });
}

export default function (options) {
    return function reviewGithubOrgTeam(review) {
        var opts = options[review.pull.head.repo.full_name];

        return getTeamId(opts.org, opts.team)
            .then(getTeamMembers)
            .then(addRank)
            .then(function (team) {
                review.team = team;
                return review;
            });
    };
}
