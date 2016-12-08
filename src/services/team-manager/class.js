import { forEach } from 'lodash';
import minimatch from 'minimatch';

import { StaticDriverFactory } from './driver-static/class';

export default class TeamManager {

  /**
   * @constructor
   *
   * @param {Array} drivers
   * @param {Object} teamModel
   */
  constructor(drivers, teamModel) {
    this.drivers = drivers;
    this.teamModel = teamModel;

    this.defaultFactory = new StaticDriverFactory();
    this.drivers.default = this.defaultFactory;
  }

  /**
   * Returns all routes
   *
   * @return {Promise.<Array.<TeamRoute>>}
   */
  getRoutes() {
    return this.teamModel.find({}).exec()
      .then(array => {
        const routes = [];

        forEach(array, (team) => {
          forEach(team.patterns, (pattern) => {
            routes.push({ team: this.getDriver(team), pattern });
          });
        });

        return routes;
      });
  }

  /**
   * Returns driver for given team.
   *
   * @param {Object} team
   *
   * @return {Object}
   */
  getDriver(team) {
    const driverName = team.driver && team.driver.name;

    if (driverName && driverName in this.drivers) {
      const options = team.driver.options || options;
      const factory = this.drivers[driverName];

      return factory.makeDriver(team, options);
    } else {
      return this.defaultFactory.makeDriver(team);
    }
  }

  /**
   * Match route and then return it
   *
   * @protected
   * @param {PullRequest} pullRequest
   *
   * @return {TeamRoute}
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
   * @return {Promise.<Team>}
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
