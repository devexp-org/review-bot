import { GitHubDriverFactory } from './class';

export default function setup(options, imports) {

  const github = imports.github;

  return new GitHubDriverFactory(github);

}
