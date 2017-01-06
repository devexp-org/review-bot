/* @flow */

import GitHub from 'github';

export default function setup(options: Object): GitHub {
  const github = new GitHub(options);

  if (options.auth) {
    github.authenticate(options.auth);
  }

  return github;
}
