import PullRequestGitHubDelayed from './class';

export default function setup(options, imports) {

  return new PullRequestGitHubDelayed(imports.github, options);

}
