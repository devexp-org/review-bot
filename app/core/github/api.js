import GitHub from 'github';

var github;

/**
 * Init github api wrapper.
 *
 * @param {Object} options
 *
 * @returns {GitHub}
 */
export function init(options) {
    github = new GitHub(options);
    github.authenticate(options.authenticate);

    return github;
}

export var github = github;
