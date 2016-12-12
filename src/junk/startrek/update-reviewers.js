import util from 'util';
import { map, forEach } from 'lodash';

/**
 * Updates reviewers field in startrek with reviewers from pull request.
 *
 * @param {Object} startrek
 * @param {Object} options
 * @param {Object} payload
 *
 * @return {Promise}
 */
export function updateReviewers(startrek, options, payload) {

  const { pullRequest } = payload;
  const issue = startrek.parseIssue(pullRequest.title, options.queues);

  if (pullRequest.review.status !== 'inprogress') {
    return Promise.reject(new Error(util.format(
      'Cannot update reviewers in startrek for not in progress pull request %s',
      pullRequest
    )));
  }

  if (!issue.length) {
    return Promise.reject(new Error(util.format(
      'Cannot find issue in pull request %s', pullRequest.toString()
    )));
  }

  const reviewers = pullRequest.get('review.reviewers');

  const promise = issue.map(task => {
    return startrek.issueUpdate(task, {
      reviewers: map(reviewers, 'login')
    });
  });

  return Promise.all(promise);

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const startrek = imports.startrek;

  forEach(options.events, (event) => {
    events.on(event, (payload) => {
      updateReviewers(startrek, options, payload)
        .catch(logger.error.bind(logger));
    });
  });

  return {};

}
