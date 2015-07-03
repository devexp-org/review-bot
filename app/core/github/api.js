import GitHub from 'github';

var github;

export function init(options) {
    github = new GitHub(options);
    github.authenticate(options.authenticate);

    return github;
}

export var github = github;
