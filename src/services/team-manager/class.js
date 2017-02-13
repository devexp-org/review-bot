import { forEach } from 'lodash';
import minimatch from 'minimatch';

import TeamDriver from './team-driver';

export default class TeamManager {

  /**
   * @constructor
   *
   * @param {TeamModel} TeamModel
   * @param {UserSearch} userSearch
   */
  constructor(TeamModel, userSearch) {
    this.TeamModel = TeamModel;
    this.userSearch = userSearch;
  }

  /**
   * Returns all teams. Only names and patterns.
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
   * Finds team by name.
   *
   * @param {String} teamName
   *
   * @return {Promise.<TeamDriver>}
   */
  findTeamByName(teamName) {
    return this.TeamModel
      .findByNameWithMembers(teamName)
      .then(team => new TeamDriver(team, this.userSearch));
  }

  /**
   * Finds team by matching routes.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<TeamDriver>}
   */
  findTeamByPullRequest(pullRequest) {
    return this.find(pullRequest)
      .then(route => this.findTeamByName(route.team));
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
