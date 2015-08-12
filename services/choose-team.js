'use strict';

import _ from 'lodash';

import Team from '../modules/team';

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

  (options.routes || []).forEach(route => {
    _.forEach(route, (pattern, sourceName) => {
      const source = imports[sourceName];
      const getTeam = source.getTeam.bind(source);

      if (!source) {
        throw new Error(`Source '${sourceName}' for team service is not provided`);
      }

      if (!Array.isArray(pattern)) {
        routes.push({ source: getTeam, pattern });
      } else {
        pattern.forEach(sourcePattern => {
          routes.push({ source: getTeam, pattern: sourcePattern });
        });
      }
    });
  });

  const service = new Team(routes);

  return Promise.resolve({ service });

}
