'use strict';

import _ from 'lodash';
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
        return route.getTeam(pullRequest);
      }
    }

    return [];
  }

  /**
   *
   * @param {PullRequest} pullRequest
   * @param {String} login
   *
   * @return {Developer}
   */
  findTeamMemberByPullRequest(pullRequest, login) {
    const find = (team) => _.find(team, { login });

    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];

      if (this.matchRoute(route.pattern, pullRequest)) {
        if (!route.findTeamMemberByPullRequest) {
          return route.getTeam(pullRequest).then(find);
        } else {
          return route.findTeamMemberByPullRequest(pullRequest, login);
        }
      }
    }

    return null;
  }

  /**
   *
   * @param {PullRequest} pullRequest
   *
   * @return {String}
   */
  findTeamNameByPullRequest(pullRequest) {
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];

      if (this.matchRoute(route.pattern, pullRequest)) {
        return route.team;
      }
    }

    return null;
  }

  matchRoute(pattern, pullRequest) {
    if (pattern === '*') {
      return true;
    }

    return minimatch(pullRequest.repository.full_name, pattern);
  }

}
