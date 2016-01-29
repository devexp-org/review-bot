'use strict';

import util from 'util';
import { find, cloneDeep } from 'lodash';

const EVENT_NAME = 'review:command:add';

const COMMAND_REGEXP = new RegExp(
  '(?:^|\\s)' + '\\+@?(\\w+)' + '(?:\\s|$)|' + // +username +@username
  '(?:^|\\s)' + '\/?add\\s+@?(\\w+)' + '(?:\\s|$)', // /add username /add @username
  'i'
);

export function getParticipant(command) {
  const participant = command.match(COMMAND_REGEXP);

  return participant[1] || participant[2];
}

export default function commandService(options, imports) {
  const { team, action, logger, events } = imports;

  /**
   * Handle '/add' command.
   *
   * @param {Object} payload - github webhook payload.
   * @param {String} command - line with user command
   *
   * @return {Promise}
   */
  const addCommand = function addCommand(payload, command) {

    let newReviewer;

    const pullRequest = payload.pullRequest;
    const reviewers = pullRequest.get('review.reviewers');

    logger.info(
      '"/add" [%s – %s] %s',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    const newReviewerLogin = getParticipant(command);

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
