import { find } from 'lodash';
import AbstractDriver, { AbstractDriverFrontEnd } from '../driver';

export default class GitHubDriver extends AbstractDriver {

  constructor(github) {
    super();

    this.github = github;
  }

  makeDriver(team, config) {
    return new GitHubDriverFrontEnd(this.github, team, config);
  }

}

export class GitHubDriverFrontEnd extends AbstractDriverFrontEnd {

  /**
   * @constructor
   *
   * @param {Object} github - GitHub API module
   * @param {Object} team
   * @param {Object} config
   */
  constructor(github, team, config) {
    super(team, config);

    if (!config.orgName) {
      throw new Error('Required parameter "orgName" is not given');
    }

    this.github = github;
    this.orgName = config.orgName;
    this.slugName = config.slugName;
  }

  /**
   * @override
   */
  getMembersForReview() {
    if (!this.slugName) {
      return this.getMembersByOrgName(this.orgName);
    } else {
      return this.getTeamId(this.orgName, this.slugName)
        .then(teamId => this.getMembersByTeamId(teamId));
    }
  }

  /**
   * Find team id by org name and slug
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
          reject(new Error('GitHub API: Error: ' + err));
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
          reject(new Error('GitHub API: Error: ' + err));
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
          reject(new Error('GitHub API: Error: ' + err));
          return;
        }

        resolve(result);
      });
    });
  }

}
