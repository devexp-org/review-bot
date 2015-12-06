import util from 'util';
import { find, reject } from 'lodash';

const EVENT_NAME = 'review:command:remove';

const COMMAND_REGEXP = new RegExp(
  '(?:^|\\W)' + '\\-@?([\\w]+)' + '(?:\\W|$)|' + // -username -@username
  '(?:^|\\W)' + '\/?remove\\s+@?([\\w]+)' + '(?:\\W|$)', // /remove username /remove @username
  'i'
);

export function getParticipant(command) {
  const participant = command.match(COMMAND_REGEXP);

  return participant[1] || participant[2];
}

export default function commandService(options, imports) {
  const { action, logger, events } = imports;
  const minReviewersCount = options.min;

  /**
   * Handle '/remove' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const removeCommand = function removeCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const reviewers = pullRequest.get('review.reviewers');

    logger.info(
      '"/remove" [%s – %s] %s',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    const reviewerLogin = getParticipant(command);

    if (!find(reviewers, { login: reviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove reviewer %s but he is not in reviewers list',
        payload.comment.user.login,
        reviewerLogin
      )));
    }

    if (reviewers.length - 1 < minReviewersCount) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove reviewer %s but there should be at least %s reviewers in pull request',
        payload.comment.user.login,
        reviewerLogin,
        minReviewersCount
      )));
    }

    const newReviewers = reject(reviewers, { login: reviewerLogin });

    return action
      .save({ reviewers: newReviewers }, pullRequest.id)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });
      });

  };

  return Promise.resolve({ service: removeCommand });
}
