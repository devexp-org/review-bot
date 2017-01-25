import GitHubUser from './class';

/**
 * Creates "Invater" service.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Invater}
 */
export default function setup(options, imports) {

  const github = imports.github;

  return new GitHubUser(github);

}
