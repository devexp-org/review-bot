import util from 'util';
import { find, cloneDeep } from 'lodash';

export const EVENT_NAME = 'review:command:add';

export const COMMAND_RE = /\/add (@\w+)/;

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const teamDispatcher = imports['team-dispatcher'];
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/add' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   * @param {Array}  arglist - parsed arguments for command.
   *
   * @return {Promise}
   */
  const addCommand = function addCommand(command, payload, arglist) {

    let newReviewer;

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const newReviewerLogin = arglist[0];

    const pullRequestReviewers = pullRequest.get('review.members', []);

    logger.info('"/add" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot add a reviewer for the closed pull request ${pullRequest}`
      ));
    }

    if (find(pullRequestReviewers, { login: newReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to add the reviewer %s, but he is already a reviewer %s',
        commentUser, newReviewerLogin, pullRequest
      )));
    }

    return teamDispatcher
      .findTeamByPullRequest(pullRequest)
      .then(team => team.findTeamMember(pullRequest, newReviewerLogin))
      .then(user => {
        if (!user) {
          return Promise.reject(new Error(util.format(
            '%s tried to add %s, but there is no user with the same login %s',
            commentUser, newReviewerLogin, pullRequest
          )));
        }

        newReviewer = cloneDeep(user);

        pullRequestReviewers.push(newReviewer);

        return pullRequestReview.updateReview(
          pullRequest, { reviewers: pullRequestReviewers }
        );
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest, newReviewer });

        return pullRequest;
      });

  };

  return addCommand;

}
