import { forEach } from 'lodash';

/**
 * Updates status of startrek task.
 *
 * @param {Object} startrek
 * @param {Object} options
 * @param {Object} payload
 * @param {String} status
 * @param {Logger} logger
 *
 * @return {Promise}
 */
export function setIssueStatus(startrek, options, payload, status, logger) {
  const { pullRequest } = payload;
  const issue = startrek.parseIssue(pullRequest.title, options.queues);

  if (!issue.length) {
    logger.info('Cannot find issue in pull request %s', pullRequest);
    return Promise.resolve();
  }

  const promise = issue.map(task => {
    return startrek.issueStatusChange(task, status);
  });

  return Promise.all(promise);
}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('startrek.set-issue-status');
  const startrek = imports['yandex-startrek'];

  forEach(options.events, (event) => {
    events.on(event, (payload) => {
      setIssueStatus(startrek, options, payload, 'review', logger)
        .catch(logger.error.bind(logger));
    });
  });

}
