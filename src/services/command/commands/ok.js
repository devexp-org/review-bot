import util from 'util';
import { find, cloneDeep } from 'lodash';

export const EVENT_NAME = 'review:command:ok';

export const COMMAND_RE = /\/ok/;

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const teamDispatcher = imports['team-dispatcher'];
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/ok' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const okCommand = function okCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const pullRequestReviewers = pullRequest.get('review.reviewers');

    const commenter = find(pullRequestReviewers, { login: commentUser });

    logger.info('"/ok" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot approve review for closed pull request ${pullRequest}`
      ));
    }

    if (commentUser === pullRequest.user.login) {
      return Promise.reject(new Error(
        `%s tried approve review to himself ${pullRequest}`
      ));
    }

    if (commenter) {
      return pullRequestReview
        .approveReview(pullRequest, commentUser)
        .then(pullRequest => {
          events.emit(EVENT_NAME, { pullRequest });

          return pullRequest;
        });
    } else {
      return teamDispatcher
        .findTeamByPullRequest(pullRequest)
        .then(team => team.findTeamMember(pullRequest, commentUser))
        .then(user => {
          if (!user) {
            return Promise.reject(new Error(util.format(
              '%s tried to approve, but there is no user with the same login %s',
              commentUser, pullRequest
            )));
          }

          const newReviewer = cloneDeep(user);

          pullRequestReviewers.push(newReviewer);

          return pullRequestReview.updateReviewers(
            pullRequest, pullRequestReviewers
          );
        })
        .then(pullRequest => {
          return pullRequestReview.approveReview(pullRequest, commentUser);
        })
        .then(pullRequest => {
          events.emit(EVENT_NAME, { pullRequest });

          return pullRequest;
        });
    }
  };

  return okCommand;
}
