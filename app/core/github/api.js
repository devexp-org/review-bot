import _ from 'lodash';
import GitHub from 'github';

import * as config from 'app/core/config';
import logger from 'app/core/logger';
import { PullRequest } from 'app/core/models';

var { start, end, regex } = config.load('github').content;

var github = {
    api: {},

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
        console.log(pullRequest.extra_body);

        var newBody = start + Object.keys(pullRequest.extra_body).map((key) => {
            return '<div>' + pullRequest.extra_body[key] + '</div>';
        }) + end;

        github
            .updatePullRequestInfo(pullRequest)
            .then(pullRequest => github._updateBody(pullRequest, newBody));
    },

    /**
     * Sends github api request to update body of pull request.
     * @private
     *
     * @param {Object} pullRequest
     * @param {String} newBody
     */
    _updateBody(pullRequest, newBody) {
        this.api.pullRequests.update({
            user: pullRequest.head.repo.owner.login,
            repo: pullRequest.head.repo.name,
            number: pullRequest.number,
            title: pullRequest.title,
            body: newBody
        });
    },

    /**
     * Clears Pull Request body from generated content.
     * @private
     *
     * @param {String} body
     *
     * @returns {String} clear body
     */
    _bodyCleaner(body) {
        return body.replace(regex, '');
    }
};

github.updatePullRequest = _.debounce(github._updatePullRequestBody, 2000);

/**
 * Init github api wrapper.
 *
 * @param {Object} options
 *
 * @returns {GitHub}
 */
export function init(options) {
    var api = new GitHub(options);
    api.authenticate(options.authenticate);

    github.api = api;

    return github;
}

export default github;
