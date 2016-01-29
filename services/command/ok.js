'use strict';

import util from 'util';
import { find, cloneDeep } from 'lodash';

const EVENT_NAME = 'review:command:ok';
const EVENT_NAME_NEW_REVIEWER = EVENT_NAME + ':new_reviewer';

export default function commandService(options, imports) {

  const { action, logger, team, events } = imports;

  /**
   * Handle '/ok' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const okCommand = function okCommand(command, payload) {

    const login = payload.comment.user.login;
    const pullRequest = payload.pullRequest;
    const reviewer = find(pullRequest.get('review.reviewers'), { login });

    logger.info(
      '"/ok" [%s – %s] %s',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        '%s cannot approve review for closed pull request [%s – %s] %s',
        login, pullRequest.number, pullRequest.title, pullRequest.html_url
      )));
    }

    if (login === pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s cannot ok to his pull request',
        login
      )));
    }

    if (reviewer) {
      return action
        .approveReview(login, pullRequest.id)
        .then(pullRequest => {
          events.emit(EVENT_NAME, { pullRequest });
        });
    } else {
      return team
        .findTeamMemberByPullRequest(pullRequest, login)
        .then(user => {
          if (!user) {
            return Promise.reject(new Error(util.format(
              '%s tried to approve review, but there isn`t a user with the same login in team [%s – %s] %s',
              login,
              pullRequest.number,
              pullRequest.title,
              pullRequest.html_url
            )));
          }

          const reviewers = pullRequest.get('review.reviewers');
          const newReviewer = cloneDeep(user);

          reviewers.push(newReviewer);

          return action.save({ reviewers }, pullRequest.id);
        })
        .then(pullRequest => action.approveReview(login, pullRequest.id))
        .then(pullRequest => {
          events.emit(EVENT_NAME_NEW_REVIEWER, { pullRequest });

          return pullRequest;
        });
    }
  };

  return okCommand;
}
