import { map, find } from 'lodash';
import { StaticDriver, StaticDriverFactory } from '../driver-static/class';

export class GitHubDriver extends StaticDriver {

  /**
   * @constructor
   *
   * @param {Object} team
   * @param {Object} driverConfig
   * @param {Object} github - GitHub API module
   * @param {Object} TeamModel
   * @param {Object} UserModel
   */
  constructor(team, driverConfig, github, TeamModel, UserModel) {
    super(team);

    if (!driverConfig.orgName) {
      throw new Error('Required parameter "orgName" is not given');
    }

    this.github = github;
    this.orgName = driverConfig.orgName;
    this.slugName = driverConfig.slugName;

    this.TeamModel = TeamModel;
    this.UserModel = UserModel;
  }

  /**
   * @override
   */
  getCandidates() {
    if (!this.slugName) {
      return this.getMembersByOrgName(this.orgName).then(this.sync.bind(this));
    } else {
      return this.getTeamId(this.orgName, this.slugName)
        .then(teamId => this.getMembersByTeamId(teamId))
        .then(this.sync.bind(this));
    }
  }

  sync(members) {
    return this.syncUsers(members).then(this.syncTeam.bind(this));
  }

  syncTeam(members) {
    return this.TeamModel.findByName(this.name)
      .then(team => {
        if (!team) {
          return members;
        }

        team.members = members;
        return team.save();
      })
      .then(() => members);
  }

  syncUsers(members) {
    const promise = map(members, (member) => {
      return this.UserModel
        .findByLogin(member.login)
        .then(user => {
          if (user) {
            return user;
          }

          user = new this.UserModel({ login: member.login });
          return user.validate().then(user.save.bind(user));
        });
    });

    return Promise.all(promise);
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

export class GitHubDriverFactory extends StaticDriverFactory {

  constructor(github, TeamModel, UserModel) {
    super();
    this.github = github;
    this.TeamModel = TeamModel;
    this.UserModel = UserModel;
  }

  makeDriver(team, driverConfig) {
    return new GitHubDriver(team, driverConfig, this.github, this.TeamModel, this.UserModel);
  }

  name() {
    return 'github';
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

}
