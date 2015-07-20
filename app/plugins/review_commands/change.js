var _ = require('lodash');

var logger = require('app/core/logger');
var saveReview = require('app/core/review/actions/save');
var team = require('app/core/team');

var Err = require('terror').create('app/plugins/review_commands/change', {
    CANT_CHANGE: 'Can`t change reviewer'
});

module.exports = function startCommandCreator() {

    /**
     * Handles '/change name to name' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook hndler payload.
     *
     * @returns {Promise}
     */
    return function changeCommand(cmd, payload) {
        var pullRequest = payload.pullRequest;
        var comment = payload.comment;
        var message = cmd + ' — ' + pullRequest.title + ' [' + pullRequest.html_url + ']';

        logger.info('[/change] ' + message);
        Err.CODES.CANT_CHANGE += ' | ' + message;

        if (pullRequest.state !== 'open') {
            throw Err.createError(Err.CODES.CANT_CHANGE, 'pull request is closed');
        }

        if (pullRequest.user.login !== comment.user.login) {
            throw Err.createError(Err.CODES.CANT_CHANGE,
                comment.user.login + ' try to change reviewer but author is ' + pullRequest.user.login
            );
        }

        var oldReviewer = cmd[0].replace('@', '');
        var newReviewer;

        if (!cmd[2] || cmd[1] !== 'to') {
            newReviewer = cmd[1].replace('@', '');
        } else {
            newReviewer = cmd[2].replace('@', '');
        }

        if (newReviewer === pullRequest.user.login) {
            throw Err.createError(Err.CODES.CANT_CHANGE,
                newReviewer + ' can`t set himself\\herself as reviewer'
            );
        }

        if (_.find(pullRequest.get('review.reviewers'), { login: newReviewer })) {
            throw Err.createError(Err.CODES.CANT_CHANGE,
                'try to set ' + newReviewer + ' as reviewer but he\\she is already in reviewers'
            );
        }

        return team
            .get(pullRequest.full_name)
            .then(function (team) {
                var newReviewerInfo = _.find(team, { login: newReviewer });
                var reviewers = _.reject(pullRequest.get('review.reviewers'), { login: oldReviewer });

                if (!newReviewerInfo) {
                    throw Err.createError(Err.CODES.CANT_CHANGE,
                        'try to set ' + newReviewer + ' but there`s no user with this login in team'
                    );
                }

                reviewers.push(newReviewerInfo);
                return saveReview({ reviewers: reviewers }, pullRequest.id);
            });
    };
};
