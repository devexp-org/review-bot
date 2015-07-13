var _ = require('lodash');

var logger = require('app/core/logger');
var saveReview = require('app/core/review/actions/save');

module.exports = function startCommandCreator(options) {
    /**
     * Handles '/change name to name' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook handler payload.
     */
    return function changeCommand(cmd, payload) {
        logger.info('change command ' + payload.pullRequest.id + ' — ' + payload.pullRequest.title);

        if (payload.pullRequest.state !== 'open') {
            logger.error(
                'Can\'t change reviewer for closed pull request [' +
                    payload.pullRequest.id + ' — ' + payload.pullRequest.title +
                ']'
            );

            return;
        }

        if(payload.pullRequest.user.login !== payload.comment.user.login) {
            logger.error(
                payload.comment.user.login +
                ' try to change reviewer but author is ' +
                payload.pullRequest.user.login
            );

            return;
        }

        var oldReviewer = cmd[0].replace('@', '');
        var newReviewer = cmd[2].replace('@', '');

        if (newReviewer === payload.pullRequest.user.login) {
            logger.error(
                newReviewer +
                ' can`t set himself\\herself as reviewer for ' +
                payload.pullRequest.id + ' — ' + payload.pullRequest.title
            );
        }

        if (_.find(payload.pullRequest.review.reviewers, { login: newReviewer })) {
            logger.error(
                payload.comment.user.login +
                ' try to set ' + newReviewer + ' as reviewer but he\\she is already in reviewers list for ' +
                payload.pullRequest.id + ' — ' + payload.pullRequest.title
            );

            return;
        }

        options
            .getTeam({ pull: payload.pullRequest, team: [] })
            .then(function (result) {
                var newReviewerInfo = _.find(result.team, { login: newReviewer });
                var reviewers = _.reject(payload.pullRequest.get('review.reviewers'), { login: oldReviewer });

                if (!newReviewerInfo) {
                    logger.error(
                        payload.comment.user.login +
                        ' try to set ' + newReviewer + ' but there`s no user with this login in team for ' +
                        payload.pullRequest.id + ' — ' + payload.pullRequest.title
                    );

                    return;
                }

                reviewers.push(newReviewerInfo);

                saveReview({ reviewers: reviewers }, payload.pullRequest.id);
            });
    };
};
