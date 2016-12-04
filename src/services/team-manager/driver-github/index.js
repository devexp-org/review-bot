import GitHubDriver from './class';

export default function setup(options, imports) {

  const github = imports.github;

  return new GitHubDriver(github);

}
