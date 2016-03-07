'use strict';

import GitHubTeam from './github';

export default function (options, imports) {

  const github = imports.github;

  const service = new GitHubTeam(github, options && options.slug);

  return service;

}
