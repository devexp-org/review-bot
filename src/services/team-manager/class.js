import { forEach } from 'lodash';
import minimatch from 'minimatch';

export default class TeamManager {

  /**
   * @constructor
   *
   * @param {TeamModel} TeamModel
   * @param {Array} drivers
   * @param {Object} search
   */
  constructor(TeamModel, drivers, search) {
    this.search = search;
    this.drivers = drivers;
    this.TeamModel = TeamModel;
  }

  /**
   * Returns all teams.
   * Only name and patterns.
   *
   * @return {Promise.<Array.<Team>>}
   */
  getTeams() {
    return this.TeamModel.find({}).select({ name: 1, patterns: 1 }).exec();
  }

  /**
   * Returns all drivers.
   *
   * @return {Array.<TeamDriver>}
   */
  getDrivers() {
    return this.drivers;
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
   * Returns driver for given team.
   *
   * @param {String} teamName
   *
   * @return {TeamDriver}
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

        return driverFactory.makeDriver(this, team, driverConfig);
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
   * Returns driver of matched route.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Team>}
   */
  findTeamByPullRequest(pullRequest) {
    return this.find(pullRequest)
      .then(route => this.getTeamDriver(route.team));
  }

  /**
   * Finds reviewer by `login`.
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  findTeamMember(login) {
    return this.search.findUser(login);
  }

  /**
   * Returns `true` if pattern match to pull request and `false` otherwise.
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
