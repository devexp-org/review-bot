var api = require('github'),
    config = require('../../config'),
    github = new api(config.github);

module.exports = github;
