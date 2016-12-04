import util from 'util';

export const EVENT_NAME = 'review:command:start';
export const COMMAND_RE = '/start';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('command.start');
  const command = imports.command;
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/start' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const startCommand = function startCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    logger.info('"/start" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot start review for closed pull request ${pullRequest}`
      ));
    }

    if (pullRequest.get('review.status') !== 'open') {
      return Promise.reject(new Error(
        `Cannot start is not open review ${pullRequest}`
      ));
    }

    if (commentUser !== pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to start a review, but author is %s %s',
        commentUser, pullRequest.user.login, pullRequest
      )));
    }

    return pullRequestReview.startReview(pullRequest)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  command.addCommand('start', COMMAND_RE, startCommand);

  return startCommand;
}
