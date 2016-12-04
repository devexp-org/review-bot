import util from 'util';
import { find, reject, cloneDeep } from 'lodash';

export const EVENT_NAME = 'review:command:replace';
export const COMMAND_RE = '/replace (@?\\w+)';

export default function commandService(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('command.replace');
  const review = imports.review;
  const command = imports.command;
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/replace' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   * @param {Array}  arglist - parsed arguments for command
   *
   * @return {Promise}
   */
  const replaceCommand = function replaceCommand(command, payload, arglist) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const oldReviewerLogin = arglist.shift();

    let pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/replace" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot change reviewer for closed pull request ${pullRequest}`
      ));
    }

    if (!find(pullRequestReviewers, { login: oldReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change %s, but he is not a reviewer %s',
        commentUser, oldReviewerLogin, pullRequest
      )));
    }

    return review.choose(pullRequest)
      .then(({ reviewers }) => {
        pullRequestReviewers = reject(
          pullRequestReviewers, { login: oldReviewerLogin }
        );

        pullRequestReviewers.push(cloneDeep(reviewers.shift()));

        return pullRequestReview.updateReview(
          pullRequest, { reviewers: pullRequestReviewers }
        );
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });
  };

  command.addCommand('replace', COMMAND_RE, replaceCommand);

  return replaceCommand;
}
