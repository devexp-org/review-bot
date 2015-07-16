var _ = require('lodash');

var logger = require('app/core/logger');
var saveReview = require('app/core/review/actions/save');

var Err = require('terror').create('app/plugins/review_commands/change', {
    CANT_CHANGE: 'Can`t change reviewer — "%reason%"'
});

module.exports = function startCommandCreator(options) {
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
        var message = pullRequest.id + ' — ' + pullRequest.title + ' [' + pullRequest.html_url + ']';

        logger.info('[/change] ' + message);
        Err.CODES.CANT_CHANGE += ' | ' + message;

        if (pullRequest.state !== 'open') {
            throw Err.createError(Err.CODES.CANT_CHANGE, {
                reason: 'pull request is closed'
            });
        }

        if(pullRequest.user.login !== comment.user.login) {
            throw Err.createError(Err.CODES.CANT_CHANGE, {
                reason: comment.user.login +
                    ' try to change reviewer but author is ' +
                    pullRequest.user.login
            });
        }

        var oldReviewer = cmd[0].replace('@', '');
        var newReviewer;

        if (!cmd[2] || cmd[1] !== 'to') {
            newReviewer = cmd[1].replace('@', '');
        } else {
            newReviewer = cmd[2].replace('@', '');
        }

        if (newReviewer === pullRequest.user.login) {
            throw Err.createError(Err.CODES.CANT_CHANGE, {
                reason: newReviewer + ' can`t set himself\\herself as reviewer'
            });
        }

        if (_.find(pullRequest.get('review.reviewers'), { login: newReviewer })) {
            throw Err.createError(Err.CODES.CANT_CHANGE, {
                reason: 'try to set ' + newReviewer + ' as reviewer but he\\she is already in reviewers'
            });
        }

        return options
            .getTeam({ pull: pullRequest, team: [] })
            .then(function (result) {
                var newReviewerInfo = _.find(result.team, { login: newReviewer });
                var reviewers = _.reject(pullRequest.get('review.reviewers'), { login: oldReviewer });

                if (!newReviewerInfo) {
                    throw Err.createError(Err.CODES.CANT_CHANGE, {
                        reason: comment.user.login +
                            ' try to set ' + newReviewer + ' but there`s no user with this login in team'
                    });
                }

                reviewers.push(newReviewerInfo);

                return saveReview({ reviewers: reviewers }, pullRequest.id);
            });
    };
};
