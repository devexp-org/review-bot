import { forEach } from 'lodash';
import TeamDispatcher from './class';

/*
 * Example of config:
 *
 * {
 *   "team": {
 *     "options": {
 *       "routes": [
 *         { "team_1": ["githib/*", "jquery/*"] },
 *         { "team_2": ["nodejs/*"] },
 *         { "team_3": "visionmedia/supertest" }
 *       ]
 *     },
 *     dependencies: ["team_1", "team_2", "team_3"]
 *   }
 * }
 */

export default function setup(options, imports) {

  const routes = [];

  if (!Array.isArray(options.routes) || options.routes.length === 0) {
    throw new Error('Routes for service is not given');
  }

  forEach(options.routes, route => {
    forEach(route, (pattern, sourceName) => {
      const source = imports[sourceName];

      if (!source) {
        throw new Error(`Source '${sourceName}' for service is not given`);
      }

      if (!Array.isArray(pattern)) {
        routes.push({ team: source, name: sourceName, pattern });
      } else {
        pattern.forEach(sourcePattern => {
          routes.push({
            team: source,
            name: sourceName,
            pattern: sourcePattern
          });
        });
      }
    });
  });

  return new TeamDispatcher(routes);

}
