import { find } from 'lodash';
import { AbstractDriver, AbstractDriverFactory } from '../driver-abstract/class';

export class GitHubDriver extends AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} driverConfig
   * @param {Object} github - GitHub API module
   */
  constructor(team, driverConfig, github) {
    super(team);

    if (!driverConfig.orgName) {
      throw new Error('Required parameter "orgName" is not given');
    }

    this.github = github;
    this.orgName = driverConfig.orgName;
    this.slugName = driverConfig.slugName;
  }

  /**
   * @override
   */
  getCandidates() {
    if (!this.slugName) {
      return this.getMembersByOrgName(this.orgName);
    } else {
      return this.getTeamId(this.orgName, this.slugName)
        .then(teamId => this.getMembersByTeamId(teamId));
    }
  }

  /**
   * @override
   */
  findTeamMember(login) {
    return new Promise((resolve, reject) => {
      this.github.users.getForUser({ username: login }, (err, result) => {
        if (err) {
          reject(new Error('GitHub API: ' + err));
          return;
        }

        resolve(result);
      });
    });
  }

  /**
   * Finds team id by org name and slug
   *
   * @protected
   * @param {String} orgName
   * @param {String} teamName
   *
   * @return {Promise.<Number>}
   */
  getTeamId(orgName, teamName) {
    return new Promise((resolve, reject) => {
      this.github.orgs.getTeams({ org: orgName, per_page: 100 }, (err, result) => {
        if (err) {
          reject(new Error('GitHub API: ' + err));
          return;
        }

        const team = find(result, { slug: teamName });

        if (!team) {
          reject(new Error(`GitHub API: Slug "${teamName}" is not found`));
          return;
        }

        resolve(team.id);
      });
    });
  }

  getMembersByTeamId(teamId) {
    return new Promise((resolve, reject) => {
      const req = { id: teamId, per_page: 100 };

      this.github.orgs.getTeamMembers(req, (err, result) => {
        if (err) {
          reject(new Error('GitHub API: ' + err));
          return;
        }

        resolve(result);
      });
    });
  }

  getMembersByOrgName(orgName) {
    return new Promise((resolve, reject) => {
      const req = { org: orgName, per_page: 100 };

      this.github.orgs.getMembers(req, (err, result) => {
        if (err) {
          reject(new Error('GitHub API: ' + err));
          return;
        }

        resolve(result);
      });
    });
  }

}

export class GitHubDriverFactory extends AbstractDriverFactory {

  /**
   * @constructor
   *
   * @param {Object} github
   */
  constructor(github) {
    super();

    this.github = github;
  }

  config() {
    return {
      orgName: {
        type: 'string'
      },
      slugName: {
        type: 'string'
      }
    };
  }

  makeDriver(team, driverConfig) {
    return new GitHubDriver(team, driverConfig, this.github);
  }

}
