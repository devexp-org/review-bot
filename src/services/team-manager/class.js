import { forEach } from 'lodash';
import minimatch from 'minimatch';

export default class TeamManager {

  /**
   * @constructor
   *
   * @param {Array} drivers
   * @param {TeamModel} TeamModel
   */
  constructor(drivers, TeamModel) {
    this.drivers = drivers;

    this.TeamModel = TeamModel;
  }

  /**
   * Returns all teams. Only name and patterns.
   *
   * @return {Promise.<Array.<Team>>}
   */
  getTeams() {
    return this.TeamModel.find({}).select({ name: 1, patterns: 1 }).exec();
  }

  /**
   * Returns all routes.
   *
   * @return {Promise.<Array.<TeamRoute>>}
   */
  getRoutes() {
    return this.getTeams()
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
   * Returns all drivers.
   *
   * @return {Array}
   */
  getDrivers() {
    return this.drivers;
  }

  /**
   * Returns driver for given team.
   *
   * @param {Object} teamName
   *
   * @return {Object}
   */
  getTeamDriver(teamName) {
    return this.TeamModel
      .findByName(teamName)
      .then(team => {
        const driverName = team.driver && team.driver.name;
        const driverConfig = team.driver && team.driver.options || {};
        const driverFactory = this.drivers[driverName];

        if (!driverFactory) {
          throw new Error(`Unknown driver '${driverName}' of '${teamName}'`);
        }

        return driverFactory.makeDriver(team, driverConfig);
      });
  }

  /**
   * Match route and then return it.
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
   * Returns driver of team of matched route.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Team>}
   */
  findTeamByPullRequest(pullRequest) {
    return this.find(pullRequest).then(route => this.getTeamDriver(route.team));
  }

  /**
   * Returns `true` if pattern match to pull request full name and `false` otherwise.
   *
   * @protected
   *
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