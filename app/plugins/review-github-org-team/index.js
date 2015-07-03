import _ from 'lodash';
import { github } from 'app/core/github/api';

var cache = {};

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

export default function (options) {
    return function reviewGithubOrgTeam(review) {
        options = options[review.pull.head.repo.full_name];

        return getTeamId(options.org, options.team)
            .then(getTeamMembers)
            .then(function (review) {
                console.log('Teams: ', review);

                return review;
            })
            .then();
    };
}
