import minimatch from 'minimatch';
import DefaultDriver from './driver';

export default class TeamManager {

  /**
   * @constructor
   *
   * @param {Array} drivers
   * @param {Object} teamModel
   */
  constructor(drivers, teamModel) {
    this.drivers = drivers || {};
    this.teamModel = teamModel;

    this.defaultDriver = new DefaultDriver();
    this.drivers.default = this.defaultDriver;
  }

  /**
   * Returns all routes
   *
   * @return {Promise.<Array.<TeamRoute>>}
   */
  getRoutes() {
    return this.teamModel
      .findAll()
      .then(array => {
        const routes = [];

        [].concat(array).forEach(team => {
          [].concat(team.patterns).forEach(pattern => {
            let factory;
            let options = {};

            if (team.driver && this.drivers[team.driver.name]) {
              factory = this.drivers[team.driver.name];
              options = team.driver.options;
            } else {
              factory = this.defaultDriver;
            }

            const teamDriver = factory.makeDriver(team, options);

            routes.push({ team: teamDriver, pattern });
          });
        });

        return routes;
      });
  }

  /**
   * Match route and then return it
   *
   * @protected
   * @param {PullRequest} pullRequest
   *
   * @return {Promise}
   */
  find(pullRequest) {
    return this.getRoutes()
      .then(routes => {
        for (let i = 0; i < routes.length; i++) {
          const route = routes[i];

          if (this.matchRoute(route.pattern, pullRequest)) {
            return route;
          }
        }

        return Promise.reject(
          new Error(`No one route match pullRequest ${pullRequest}`)
        );
      });
  }

  /**
   * Return team of matched route
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Object>}
   */
  findTeamByPullRequest(pullRequest) {
    return this.find(pullRequest).then(route => route.team);
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
