var GitHub = require('github'),
    EventEmmiter = require('events').EventEmitter,
    ee = new EventEmmiter(),
    github = {};

github = {
    /**
     * Initializing
     */

    models: require('./models'),
    routes: {},
    api: {},

    initImmediately: function (options) {
        this.routes = require('./routes')(github);
        this.api = new GitHub(options);
    },

    /**
     * Event system
     */

    on: function (event, callback) {
        ee.on(event, callback);
    },

    off: function (event, callback) {
        ee.removeListener(event, callback);
    },

    emit: function (event, data) {
        ee.emit(event, data);
    }
};

/**
 * Webhook processors
 */

github.processPullRequest = require('./webhook/process_pull_request')(github);
github.processPullRequestReviewComment = require('./webhook/process_pull_request_review_comment')(github);
github.processIssueComment = require('./webhook/process_issue_comment')(github);
github.processCommitComment = require('./webhook/process_commit_comment')(github);

module.exports = github;
