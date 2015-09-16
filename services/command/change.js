'use strict';

import util from 'util';
import { find, reject } from 'lodash';

const EVENT_NAME = 'review:command:change';
const COMMAND_REGEXP = /(?:^|\W)\/?change\s+@?([-0-9a-z]+)\s+(?:to\s+)?@?([-0-9a-z]+)(?:\W|$)/;
const COMMAND_ERRORS = {
  closedPr() {
    return this.emitError(util.format(
      'Cannot change reviewer for closed pull request [%s – %s]',
      this.pullRequest.id,
      this.pullRequest.title
    ));
  },

  cantParse() {
    return this.emitError(util.format(
      'Panic! Cannot parse user `change` command `%s` [%s – %s]',
      this.command,
      this.pullRequest.id,
      this.pullRequest.title
    ));
  },

  notAnAuthor() {
    return this.emitError(util.format(
      '%s tried to change reviewer, but author is %s',
      this.payload.comment.user.login,
      this.pullRequest.user.login
    ));
  },

  notInReviewersList(oldReviewerLogin) {
    return this.emitError(util.format(
      '%s tried to change reviewer %s but he/she is not in reviewers list',
      this.comment.user.login,
      oldReviewerLogin
    ));
  },

  alreadyReviewer(oldReviewerLogin, newReviewerLogin) {
    return this.emitError(util.format(
      '%s tried to change reviewer %s to %s but he/she is already in reviewers list',
      this.comment.user.login,
      oldReviewerLogin,
      newReviewerLogin
    ));
  },

  cantSetHimself(newReviewerLogin) {
    return this.emitError(util.format(
      '%s cannot set himself as reviewer',
      newReviewerLogin
    ));
  },

  noReviewerInTeam(newReviewerLogin) {
    return this.emitError(util.format(
      '%s tried to set %s, but there are no user with the same login in team',
      this.comment.user.login,
      newReviewerLogin
    ));
  }
};

/**
 * Handle '/change' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function changeCommand(command, payload) {

  const team = payload.team;
  const action = payload.action;
  const logger = payload.logger;
  const events = payload.events;

  const pullRequest = payload.pullRequest;

  const commandError = payload.baseError(COMMAND_ERRORS, command, payload);

  logger.info('"/change" [%s – %s]', pullRequest.id, pullRequest.title);

  if (pullRequest.state !== 'open') {
    return commandError.closedPr(command, payload);
  }

  const participant = command.match(COMMAND_REGEXP);

  if (!participant) {
    return commandError.cantParse(command, payload);
  }

  const oldReviewerLogin = participant[1];
  const newReviewerLogin = participant[2];

  let reviewers = pullRequest.get('review.reviewers');

  if (pullRequest.user.login !== payload.comment.user.login) {
    return commandError.notAnAuthor(command, payload);
  }

  if (!find(reviewers, { login: oldReviewerLogin })) {
    return commandError.notInReviewersList(oldReviewerLogin);
  }

  if (find(reviewers, { login: newReviewerLogin })) {
    return commandError.alreadyReviewer(oldReviewerLogin, newReviewerLogin);
  }

  if (newReviewerLogin === pullRequest.user.login) {
    return commandError.cantSetHimself(newReviewerLogin);
  }

  return team
    .findByPullRequest(pullRequest)
    .then(result => {
      const newReviewer = find(result, { login: newReviewerLogin });

      if (!newReviewer) {
        return commandError.noReviewerInTeam(newReviewerLogin);
      }

      reviewers = reject(reviewers, { login: oldReviewerLogin });
      reviewers.push(newReviewer);

      events.emit(EVENT_NAME, { pullRequest });

      return action.save({ reviewers }, pullRequest.id);
    });

}
