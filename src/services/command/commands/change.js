import util from 'util';
import { find, reject, cloneDeep } from 'lodash';

export const EVENT_NAME = 'review:command:change';

export const COMMAND_RE = /\/change (@\w+)(?: | to )(@\w+)/;

export default function commandService(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const teamDispatcher = imports['team-dispatcher'];
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/change' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   * @param {Array}  arglist - parsed arguments for command
   *
   * @return {Promise}
   */
  const changeCommand = function changeCommand(command, payload, arglist) {

    let newReviewer;

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const oldReviewerLogin = arglist.shift();
    const newReviewerLogin = arglist.shift();

    let pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/change" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot change reviewer for closed pull request ${pullRequest}`
      ));
    }

    if (!oldReviewerLogin || !newReviewerLogin) {
      return Promise.reject(new Error(util.format(
        'Cannot parse `change` command `%s` %s',
        command, pullRequest
      )));
    }

    // TODO config this
    if (commentUser !== pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to change reviewer, but author is %s %s',
        commentUser, pullRequest.user.login, pullRequest
      )));
    }

    if (newReviewerLogin === pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to set author as a reviewer %s',
        commentUser, newReviewerLogin, pullRequest
      )));
    }

    if (!find(pullRequestReviewers, { login: oldReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change %s to %s, but %s is not a reviewer %s',
        commentUser,
        oldReviewerLogin,
        newReviewerLogin,
        oldReviewerLogin,
        pullRequest
      )));
    }

    if (find(pullRequestReviewers, { login: newReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change %s to %s, but %s is already a reviewer %s',
        commentUser,
        oldReviewerLogin,
        newReviewerLogin,
        newReviewerLogin,
        pullRequest
      )));
    }

    return teamDispatcher
      .findTeamByPullRequest(pullRequest)
      .then(team => team.findTeamMember(pullRequest, newReviewerLogin))
      .then(user => {
        if (!user) {
          return Promise.reject(new Error(util.format(
            '%s tried to set %s, but there is no user with the same login %s %s',
            commentUser, newReviewerLogin, pullRequest
          )));
        }

        newReviewer = cloneDeep(user);

        pullRequestReviewers = reject(
          pullRequestReviewers, { login: oldReviewerLogin }
        );

        pullRequestReviewers.push(newReviewer);

        return pullRequestReview.updateReviewers(
          pullRequest, pullRequestReviewers
        );
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });
  };

  return changeCommand;
}
