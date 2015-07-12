var _ = require('lodash');
var GitHub = require('github');
var config = require('app/core/config');
var logger = require('app/core/logger');
var PullRequest = require('app/core/models').get('PullRequest');

var githubConfig = config.load('github');
var start = githubConfig.content.start;
var end = githubConfig.content.end;

var github = {
    api: {},

    /**
     * Init github api wrapper.
     *
     * @param {Object} options
     *
     * @returns {this}
     */
    init: function init(options) {
        var api = new GitHub(options);
        api.authenticate(options.authenticate);

        this.api = api;

        return this;
    },

    /**
     * Adds content to pull request body.
     *
     * @param {Number} pullId
     * @param {String} id - unique content id.
     * @param {String} content - any content which will be placed in pull request body.
     */
    setBodyContent: function setBodyContent(pullId, id, content) {
        var _this = this;

        PullRequest
            .findById(pullId)
            .then(function (pullRequest) {
                pullRequest.extra_body = pullRequest.extra_body || {};
                pullRequest.extra_body[id] = content;

                pullRequest.save(function (err, pullRequest) {
                    if (err) logger.error(err);

                    _this._updatePullRequestBody(pullRequest);
                });
            }, logger.error.bind(logger));
    },

    /**
     * Loads pull request info and updates it in mongo.
     *
     * @param {Object} pullRequest
     *
     * @returns {Promise}
     */
    updatePullRequestInfo: function setBodyContent(pullRequest) {
        var _this = this;

        return new Promise(function (resolve, reject) {
            _this.api.pullRequests.get({
                user: pullRequest.head.repo.owner.login,
                repo: pullRequest.head.repo.name,
                number: pullRequest.number
            }, function (err, pullRequestInfo) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }

                PullRequest
                    .findById(pullRequest.id)
                    .then(function (pullRequest) {
                        pullRequest.set(pullRequestInfo);

                        pullRequest.save(function (err, pullRequest) {
                            if (err) {
                                logger.error(err);
                                reject(err);
                            }

                            resolve(pullRequest);
                        });
                    });
            });
        });
    },

    /**
     * Updates pull request body with extra body content.
     * @private
     *
     * @param {Object} pullRequest
     */
    _updatePullRequestBody: function _updatePullRequestBody(pullRequest) {
        var _this = this;

        var extraBody = start + Object.keys(pullRequest.extra_body).map(function (key) {
            return '<div>' + pullRequest.extra_body[key] + '</div>';
        }) + end;

        this
            .updatePullRequestInfo(pullRequest)
            .then(function (pullRequest) {
                _this._updateBody(pullRequest, extraBody);
            });
    },

    /**
     * Sends github api request to update body of pull request.
     * @private
     *
     * @param {Object} pullRequest
     * @param {String} extraBody
     */
    _updateBody: function _updateBody(pullRequest, extraBody) {
        this.api.pullRequests.update({
            user: pullRequest.head.repo.owner.login,
            repo: pullRequest.head.repo.name,
            number: pullRequest.number,
            title: pullRequest.title,
            body: pullRequest.body + extraBody
        });
    }
};

github._updatePullRequestBody = _.debounce(github._updatePullRequestBody.bind(github), 2000);

module.exports = github;
