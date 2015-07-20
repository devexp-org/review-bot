var _ = require('lodash');

var logger = require('app/core/logger');
var review = require('app/core/review/review');
var saveReview = require('app/core/review/actions/save');

module.exports = function startCommandCreator() {

    /**
     * Handles '/busy' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook handler payload.
     */
    return function busyCommand(cmd, payload) {
        logger.info('busy command ' + payload.pullRequest.id + ' — ' + payload.pullRequest.title);

        if (payload.pullRequest.state !== 'open') {
            logger.error(
                'Can\'t change reviewer for closed pull request [' +
                    payload.pullRequest.id + ' — ' + payload.pullRequest.title +
                ']'
            );

            return;
        }

        if (_.find(payload.pullRequest.review.reviewers, { login: payload.comment.user.login })) {
            review(payload.pullRequest.id)
                .then(
                    function (resultReview) {
                        var newReviewer = resultReview.team[0];
                        var reviewers = _.reject(payload.pullRequest.get('review.reviewers'), {
                            login: payload.comment.user.login
                        });

                        reviewers.push(newReviewer);

                        saveReview({ reviewers: reviewers }, payload.pullRequest.id);
                    },
                    logger.error.bind(logger)
                );
        } else {
            logger.error(
                payload.comment.user.login +
                ' try to change reviewer but not in reviewers list for ' +
                payload.pullRequest.id + ' — ' + payload.pullRequest.title
            );
        }
    };
};
