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

  getDrivers() {
    return this.drivers;
  }

  /**
   * Returns all routes
   *
   * @return {Promise.<Array.<TeamRoute>>}
   */
  getRoutes() {
    return this.teamModel.find({}).select({ name: 1, patterns: 1 }).exec()
      .then(array => {
        const routes = [];

        forEach(array, (team) => {
          forEach(team.patterns, (pattern) => {
            routes.push({ team: team.name, pattern });
          });
        });

        return routes;
      });
  }

  /**
   * Returns driver for given team.
   *
   * @param {Object} teamName
   *
   * @return {Object}
   */
  getDriver(teamName) {
    return this.teamModel
      .findByNameWithMembers(teamName)
      .then(team => {
        const driverName = team.driver && team.driver.name;
        const driverConfig = team.driver && team.driver.options || {};
        const driverFactory = this.drivers[driverName] || this.defaultFactory;

        return driverFactory.makeDriver(team, driverConfig);
      });
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
    return this.find(pullRequest).then(route => this.getDriver(route.team));
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
