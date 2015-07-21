import _ from 'lodash';
import GitHub from 'github';
import Terror from 'terror';
import * as models from 'app/modules/models';

const PullRequest = models.get('PullRequest');

const Err = Terror.create('app/modules/github/api', {
    PULL_INFO: '#getPullRequestInfo — pull request info error',
    PULL_NOT_FOUND: '#%method% — pull request not found — %id%',
    UPDATE_BODY: '#_updateBody',
    SAVE_PULL: '#savePullRequestInfo — cannot save pull',
    API_ERR: 'Github api error'
});

let start, end;

const github = {
    api: {},

    /**
     * Init github api wrapper.
     *
     * @param {Object} options
     *
     * @returns {this}
     */
    init(options) {
        const api = new GitHub(options);
        api.authenticate(options.authenticate);

        start = options.content.start;
        end = options.content.end;

        this.api = api;

        return this;
    },

    /**
     * Adds content to pull request body.
     *
     * @param {Number} pullId
     * @param {String} id - unique content id.
     * @param {String} content - any content which will be placed in pull request body.
     *
     * @returns {Promise}
     */
    setBodyContent(pullId, id, content) {
        var _this = this;

        return PullRequest
            .findById(pullId)
            .then(pullRequest => {
                if (!pullRequest) {
                    return Promise.reject(
                        Err.createError(Err.CODES.PULL_NOT_FOUND, { method: 'setBodyContent', id: pullId })
                    );
                }

                var extraBody = _.clone(pullRequest.get('extra_body') || {});
                extraBody[id] = content;

                pullRequest.extra_body = extraBody;

                return pullRequest.save();
            })
            .then(pullRequest => {
                _this._updatePullRequestBody(pullRequest);

                return pullRequest;
            });
    },

    /**
     * Requests info for given pull request from github api.
     *
     * @param {Object} pullRequest
     *
     * @returns {Promise}
     */
    getPullRequestInfo(pullRequest) {
        return new Promise((resolve, reject) => {
            this.api.pullRequests.get({
                user: pullRequest.org,
                repo: pullRequest.repo,
                number: pullRequest.number
            }, function (error, pullRequestInfo) {
                error
                    ? reject(Err.createError(Err.CODES.PULL_INFO, error))
                    : resolve(pullRequestInfo);
            });
        });
    },

    /**
     * Saves pull request info.
     *
     * @param {Object} pullRequestInfo
     *
     * @returns {Promise}
     */
    savePullRequestInfo(pullRequestInfo) {
        return new Promise((resolve, reject) => {
            PullRequest
                .findById(pullRequestInfo.id)
                .then(pullRequest => {
                    if (!pullRequest) {
                        return reject(
                            Err.createError(Err.CODES.PULL_NOT_FOUND, { method: 'savePullRequestInfo', id: pullRequest.id })
                        );
                    }

                    pullRequest.set(pullRequestInfo);
                    pullRequest.save((error, pullRequest) => {
                        error
                            ? reject(Err.createError(Err.CODE.SAVE_PULL, error))
                            : resolve(pullRequest);
                    });
                });
        });
    },

    /**
     * Loads pull request info and updates it in mongo.
     *
     * @param {Object} pullRequest
     *
     * @returns {Promise}
     */
    updatePullRequestInfo(pullRequest) {
        return this.getPullRequestInfo(pullRequest)
            .then(this.savePullRequestInfo);
    },

    /**
     * Get files changed in pull requets.
     *
     * @param {Object} pullRequest
     *
     * @returns {Promise}
     */
    getPullRequestFiles(pullRequest) {
        return new Promise((resolve, reject) => {
            github.api.pullRequests.getFiles({
                user: pullRequest.org,
                repo: pullRequest.repo,
                number: pullRequest.number,
                per_page: 100
            }, function (error, files) {
                error
                    ? reject(Err.createError(Err.CODES.API_ERR, error))
                    : resolve(files.map(function (file) {
                        file.patch = '';
                        return file;
                    }));
            });
        });
    },

    /**
     * Updates pull request body with extra body content.
     *
     * @param {Object} pullRequest
     *
     * @returns {Promise}
     */
    _updatePullRequestBody(pullRequest) {
        if (!pullRequest.extra_body) return false;

        var _this = this;
        var extraBody = start + Object.keys(pullRequest.extra_body).map(function (key) {
            return '<div>' + pullRequest.extra_body[key] + '</div>';
        }) + end;

        return this
            .updatePullRequestInfo(pullRequest)
            .then(pullRequest => {
                _this._updateBody(pullRequest, extraBody);

                return pullRequest;
            });
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
            user: pullRequest.org,
            repo: pullRequest.repo,
            number: pullRequest.number,
            title: pullRequest.title,
            body: pullRequest.body + extraBody
        }, function (err) {
            if (err) {
                throw Err.createError(Err.CODES.UPDATE_BODY, err);
            }
        });
    }
};

module.exports = github;
