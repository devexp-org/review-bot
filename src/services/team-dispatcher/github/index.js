import GitHubTeam from './class';

export default function setup(options, imports) {

  const github = imports.github;

  const service = new GitHubTeam(
    github,
    options.orgName,
    options.slugName,
    options.overrides
  );

  return service;

}
