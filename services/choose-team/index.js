'use strict';

import _ from 'lodash';

import Team from '../../modules/team';

/*

Example of config:

{
  "team": {
    "options": {
      "routes": [
        { "team_github_1": ["serp/*", "search-interfaces/*"] },
        { "team_github_2": ["devexp/*"] },
        { "team_config_1": "serp-contribs/tyrion" }
      ]
    },
    dependencies: [
      "team_github_1",
      "team_github_2",
      "team_config_1"
    ]
  }
}

*/

export default function (options, imports) {

  const routes = [];

  if (!Array.isArray(options.routes) || options.routes.length === 0) {
    throw new Error('Routes for service is not provided');
  }

  options.routes.forEach(route => {

    _.forEach(route, (pattern, sourceName) => {

      const source = imports[sourceName];

      if (!source) {
        throw new Error(`Source '${sourceName}' for team service is not provided`);
      }

      const getTeam = source.getTeam.bind(source);
      const getMember = source.getMember.bind(source);

      if (!Array.isArray(pattern)) {
        routes.push({ getTeam, getMember, pattern });
      } else {
        pattern.forEach(sourcePattern => {
          routes.push({ getTeam, getMember, pattern: sourcePattern, team: sourceName });
        });
      }

    });

  });

  return new Team(routes);

}
