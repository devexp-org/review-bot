var logger = require('app/core/logger');
var saveReview = require('app/core/review/actions/save');

module.exports = function startCommandCreator() {
    /**
     * Handles '/start' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook handler payload.
     */
    return function startCommand(cmd, payload) {
        logger.info('start command ' + payload.pullRequest.id + ' — ' + payload.pullRequest.title);

        if (payload.pullRequest.state !== 'open') {
            logger.error(
                'Can\'t start review for closed pull request [' +
                    payload.pullRequest.id + ' — ' + payload.pullRequest.title +
                ']'
            );

            return;
        }

        if(payload.pullRequest.user.login !== payload.comment.user.login) {
            logger.error(
                payload.comment.user.login +
                ' try to start review but author is ' +
                payload.pullRequest.user.login);

            return;
        }

        saveReview({ status: 'inprogress' }, payload.pullRequest.id);
    };
};
