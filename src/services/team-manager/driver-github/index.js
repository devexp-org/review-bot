import { GitHubDriverFactory } from './class';

export default function setup(options, imports) {

  const model = imports.model;
  const github = imports.github;

  return new GitHubDriverFactory(github, model('team'), model('user'));

}
