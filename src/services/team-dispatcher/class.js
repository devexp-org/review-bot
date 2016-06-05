import minimatch from 'minimatch';

export default class TeamDispatcher {

  /**
   * @constructor
   *
   * @param {Array.<TeamRoute>} routes
   */
  constructor(routes) {
    this.routes = routes || [];
  }

  /**
   * Match route and then return one property of them.
   *
   * @protected
   * @param {PullRequest} pullRequest
   * @param {String} property
   *
   * @return {*}
   */
  find(pullRequest, property) {
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];

      if (this.matchRoute(route.pattern, pullRequest)) {
        return route[property];
      }
    }

    return null;
  }

  /**
   * Return team of matched route
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Array.<Developer>}
   */
  findTeamByPullRequest(pullRequest) {
    return this.find(pullRequest, 'team');
  }

  /**
   * Return name of matched route
   *
   * @param {PullRequest} pullRequest
   *
   * @return {String}
   */
  findTeamNameByPullRequest(pullRequest) {
    return this.find(pullRequest, 'name');
  }

  /**
   * @protected
   * @param {String} pattern
   * @param {PullRequest} pullRequest
   *
   * @return {Boolean}
   */
  matchRoute(pattern, pullRequest) {
    if (pattern === '*') {
      return true;
    }

    return minimatch(pullRequest.get('repository.full_name'), pattern);
  }

}
