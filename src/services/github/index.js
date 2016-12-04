import GitHub from 'github';

export default function setup(options) {

  const github = new GitHub(options);

  if (options.auth) {
    github.authenticate(options.auth);
  }

  return github;

}
