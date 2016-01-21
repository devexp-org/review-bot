'use strict';

import GitHubTeam from '../modules/team/github';

export default function (options, imports) {

  const github = imports.github;

  return new GitHubTeam(github, options.slug);

}
