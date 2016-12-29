import { map, forEach } from 'lodash';

/**
 * Updates reviewers field in startrek with reviewers from pull request.
 *
 * @param {Object} startrek
 * @param {Object} options
 * @param {Object} payload
 * @param {Object} logger
 *
 * @return {Promise}
 */
export function updateReviewers(startrek, options, payload, logger) {

  const { pullRequest } = payload;
  const issue = startrek.parseIssue(pullRequest.title, options.queues);

  if (pullRequest.review.status !== 'inprogress') {
    logger.info(
      'Cannot update reviewers in startrek for not in progress pull request %s',
      pullRequest
    );
    return Promise.resolve();
  }

  if (!issue.length) {
    logger.info('Cannot find issue in pull request %s', pullRequest);
    return Promise.resolve();
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
  const logger = imports.logger.getLogger('startrek');
  const startrek = imports['yandex-startrek'];

  forEach(options.events, (event) => {
    events.on(event, (payload) => {
      updateReviewers(startrek, options, payload, logger)
        .catch(logger.error.bind(logger));
    });
  });

}
