import PullRequestGitHub from './class';

export default function setup(options, imports) {

  return new PullRequestGitHub(imports.github, options);

}
