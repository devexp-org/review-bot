import GitHub from 'github';

/**
 * Creates "GitHub" service.
 *
 * @param {Object} options Options for github.
 *   {@link https://www.npmjs.com/package/github "github" package on NPM}
 *
 * @return {GitHub}
 */
export default function setup(options) {
  const github = new GitHub(options);

  if (options.auth) {
    github.authenticate(options.auth);
  }

  return github;
}

/**
 * @typedef {Object} GitHub
 *
 * @property {GitHubOrgs} orgs
 * @property {GitHubUsers} users
 * @property {GitHubRepos} repos
 * @property {GitHubPullRequests} pullRequests
 */

/**
 * @classdesc GitHub API methods about organisations.
 *
 * @name GitHubOrgs
 * @class
 */

/**
 * Returs teams
 *
 * @name GitHubOrgs#getTeams
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Returns members.
 *
 * @name GitHubOrgs#getMembers
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Returns team members.
 *
 * @name GitHubOrgs#getTeamMembers
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Returns a single user.
 *
 * @name GitHubUsers#getForUser
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Returns commits on a repository.
 *
 * @name GitHubRepos#getCommits
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Returns the contents of a file or directory in a repository.
 *
 * @name GitHubRepos#getContent
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Creates a status.
 *
 * @name GitHubRepos#createStatus
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Returns a single pull request.
 *
 * @name GitHubPullRequests#get
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Updates a pull request
 *
 * @name GitHubPullRequests#update
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */

/**
 * Returns pull requests files.
 *
 * @name GitHubPullRequests#getFiles
 * @method
 *
 * @param {Object} request GitHub API request object
 * @param {Function} callback
 *
 * @return {void}
 */
