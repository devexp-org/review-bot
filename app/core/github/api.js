import _ from 'lodash';
import GitHub from 'github';

import * as config from 'app/core/config';
import logger from 'app/core/logger';
import { PullRequest } from 'app/core/models';

var { start, end } = config.load('github').content;

var github = {
    api: {},

    /**
     * Init github api wrapper.
     *
     * @param {Object} options
     *
     * @returns {this}
     */
    init(options) {
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
    setBodyContent(pullId, id, content) {
        PullRequest
            .findById(pullId)
            .then((pullRequest) => {
                pullRequest.extra_body = pullRequest.extra_body || {};
                pullRequest.extra_body[id] = content;

                pullRequest.save((err, pullRequest) => {
                    if (err) logger.error(err);
                    this._updatePullRequestBody(pullRequest);
                });
            }, ::logger.error);
    },

    /**
     * Loads pull request info and updates it in mongo.
     *
     * @param {Object} pullRequest
     *
     * @returns {Promise}
     */
    updatePullRequestInfo(pullRequest) {
        return new Promise((resolve, reject) => {
            this.api.pullRequests.get({
                user: pullRequest.head.repo.owner.login,
                repo: pullRequest.head.repo.name,
                number: pullRequest.number
            }, (err, pullRequestInfo) => {
                if (err) reject(err);

                PullRequest
                    .findById(pullRequest.id)
                    .then((pullRequest) => {
                        pullRequest.set(pullRequestInfo);

                        resolve(pullRequest.save());
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
    _updatePullRequestBody(pullRequest) {
        var extraBody = start + Object.keys(pullRequest.extra_body).map((key) => {
            return '<div>' + pullRequest.extra_body[key] + '</div>';
        }) + end;

        this
            .updatePullRequestInfo(pullRequest)
            .then(pullRequest => this._updateBody(pullRequest, extraBody));
    },

    /**
     * Sends github api request to update body of pull request.
     * @private
     *
     * @param {Object} pullRequest
     * @param {String} extraBody
     */
    _updateBody(pullRequest, extraBody) {
        this.api.pullRequests.update({
            user: pullRequest.head.repo.owner.login,
            repo: pullRequest.head.repo.name,
            number: pullRequest.number,
            title: pullRequest.title,
            body: pullRequest.body + extraBody
        });
    }
};

github.updatePullRequest = _.debounce(::github._updatePullRequestBody, 2000);

export default github;
