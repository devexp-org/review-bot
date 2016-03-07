'use strict';

import util from 'util';
import { find, cloneDeep } from 'lodash';

const EVENT_NAME = 'review:command:add';

export function getParticipant(command, parseLogins) {
  const participant = parseLogins(command, ['/add', '+']);

  return participant[0];
}

export default function commandService(options, imports) {
  const { team, action, logger, events, parseLogins } = imports;

  /**
   * Handle '/add' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const addCommand = function addCommand(command, payload) {

    let newReviewer;

    const pullRequest = payload.pullRequest;
    const reviewers = pullRequest.get('review.reviewers');

    logger.info(
      '"/add" [%s – %s] %s',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    const newReviewerLogin = getParticipant(command, parseLogins);

    if (find(reviewers, { login: newReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to add reviewer %s but he is already in reviewers list',
        payload.comment.user.login,
        newReviewerLogin
      )));
    }

    return team
      .findTeamMemberByPullRequest(pullRequest, newReviewerLogin)
      .then(user => {
        if (!user) {
          return Promise.reject(new Error(util.format(
            '%s tried to set %s, but there are no user with the same login in team',
            payload.comment.user.login,
            newReviewerLogin
          )));
        }

        newReviewer = cloneDeep(user);
        reviewers.push(newReviewer);

        return action.save({ reviewers }, pullRequest.id);
      }).then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest, newReviewer });
      });

  };

  return addCommand;
}
