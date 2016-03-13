'use strict';

import util from 'util';
import { map, cloneDeep, filter, difference, isEmpty, compact, partial } from 'lodash';

const EVENT_NAME = 'review:command:add';

/**
 * Gets logins from command string.
 *
 * @param {String} command
 * @param {Function} parseLogins
 *
 * @return {String[]}
 */
export function getParticipants(command, parseLogins) {
  return parseLogins(command, ['/add', '+']);
}

/**
 * Returns only new reviewers logins.
 *
 * @param {String[]} participants
 * @param {String[]} alreadyReviewers
 *
 * @return {String[]}
 */
export function getNewReviewersLogins(participants, alreadyReviewers) {
  return isEmpty(alreadyReviewers) ?
    participants :
    difference(participants, alreadyReviewers);
}

/**
 * Gets info for reviewers.
 *
 * @param {Object} team
 * @param {PullRequest} pullRequest
 * @param {String[]} newReviewersLogins
 *
 * @return {Promise}
 */
export function getReviewersInfo(team, pullRequest, newReviewersLogins) {
  return Promise
    .all(map(
      newReviewersLogins,
      login => team.findTeamMemberByPullRequest(pullRequest, login)
    ));
}

/**
 * Builds up new reviewers list from info.
 *
 * @param {Object} logger
 * @param {String} command
 * @param {String} commentAuthor
 * @param {String[]} newReviewersLogins
 * @param {Object[]} reviewersInfo
 *
 * @return {Promise}
 */
export function buildNewReviewersList(logger, command, commentAuthor, newReviewersLogins, reviewersInfo) {
  const newReviewers = map(compact(reviewersInfo), reviewer => {
    logger.info('/add new reviewer: %s — %s', reviewer.login, command);

    return cloneDeep(reviewer);
  });

  if (isEmpty(compact(newReviewers))) {
    return Promise.reject(new Error(util.format(
      '%s tried to set %s, but there are no users with the same logins in team',
      commentAuthor,
      newReviewersLogins
    )));
  }

  return newReviewers;
}

/**
 * Command service factory.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Function}
 */
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
    const { commandLog, pullRequest } = payload;
    const currentReviewers = pullRequest.get('review.reviewers');
    const participants = getParticipants(command, parseLogins);

    commandLog('/add', command, payload);

    if (isEmpty(participants)) {
      return Promise.reject(new Error(util.format(
        'Panic! Cannot parse user `add` command `%s` [%s – %s] %s',
        command,
        pullRequest.number,
        pullRequest.title,
        pullRequest.html_url
      )));
    }

    const alreadyReviewers = map(
      filter(currentReviewers, reviewer => participants.includes(reviewer.login)),
      'login'
    );
    if (!isEmpty(alreadyReviewers)) {
      logger.info(
        '%s tried to add reviewers "%s" but they are already in reviewers list',
        payload.comment.user.login,
        alreadyReviewers.join(', ')
      );
    }

    const newReviewersLogins = getNewReviewersLogins(participants, alreadyReviewers);
    if (isEmpty(newReviewersLogins)) {
      return Promise.reject(new Error('No reviewers to add.'));
    }

    return getReviewersInfo(team, pullRequest, newReviewersLogins)
      .then(partial(buildNewReviewersList, logger, command, payload.comment.user.login, newReviewersLogins))
      .then(newReviewers => {
        const reviewers = currentReviewers.concat(newReviewers);

        return action.save({ reviewers }, pullRequest.id);
      })
      .then(pullRequest => {
        const newReviewers = difference(pullRequest.get('review.reviewers'), currentReviewers);

        newReviewers.forEach(newReviewer => {
          events.emit(EVENT_NAME, { pullRequest, newReviewer });
        });
      });
  };

  return addCommand;
}
