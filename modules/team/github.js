'use strict';

import _ from 'lodash';

export default class GitHubTeam {

  /**
   * @constructor
   *
   * @param {Object} github - GitHub API module
   * @param {String} [slug] - name of github group
   */
  constructor(github, slug) {
    this.github = github;
    this.slugName = slug;
  }

  getTeam(pullRequest) {
    const orgName = pullRequest.organization.login;

    if (!this.slugName) {
      return this.getOrgMembers(orgName);
    } else {
      return this
        .getTeamId(orgName, this.slugName)
        .then((teamId) => this.getTeamMembers(teamId));
    }
  }

  getOrgMembers(orgName) {
    return new Promise((resolve, reject) => {
      const req = { org: orgName, per_page: 100 };

      this.github.orgs.getMembers(req, (error, result) => {
        if (error) {
          return reject(new Error('GitHub API error: ' + error));
        }

        resolve(result);
      });
    });
  }

  getTeamId(orgName, teamName) {
    return new Promise((resolve, reject) => {
      this.github.orgs.getTeams({ org: orgName, per_page: 100 }, (error, result) => {
        if (error) {
          return reject(new Error('GitHub API error: ' + error));
        }

        const team = _.head(_.filter(result, { slug: teamName }), 1);

        if (!team) {
          return reject(new Error('GitHub API: Slug `' + teamName + '` not found'));
        }

        resolve(team.id);
      });
    });
  }

  getTeamMembers(teamId) {
    return new Promise((resolve, reject) => {
      const req = { id: teamId, per_page: 100 };

      this.github.orgs.getTeamMembers(req, (error, result) => {
        if (error) {
          return reject('GitHub API error: ' + error);
        }

        resolve(result);
      });
    });
  }

}
