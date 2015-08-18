'use strict';

import minimatch from 'minimatch';

export default class Team {

  /**
   * @constructor
   *
   * @param {Array<TeamRoute>} routes
   */
  constructor(routes) {
    this.routes = routes || [];
  }

  /**
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Array<Developer>}
   */
  findByPullRequest(pullRequest) {
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];

      if (this.matchRoute(route.pattern, pullRequest)) {
        return route.source(pullRequest);
      }
    }

    return [];
  }

  matchRoute(pattern, pullRequest) {
    if (pattern === '*') {
      return true;
    }

    return minimatch(pullRequest.repository.full_name, pattern);
  }

}
