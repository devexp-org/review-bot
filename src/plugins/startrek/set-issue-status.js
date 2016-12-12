import util from 'util';
import { forEach } from 'lodash';

/**
 * Updates status of startrek task.
 *
 * @param {Object} startrek
 * @param {Object} options
 * @param {Object} payload
 * @param {String} status
 *
 * @return {Promise}
 */
export function setIssueStatus(startrek, options, payload, status) {
  const { pullRequest } = payload;
  const issue = startrek.parseIssue(pullRequest.title, options.queues);

  if (!issue.length) {
    return Promise.reject(new Error(util.format(
      'Cannot find issue in pull request %s', pullRequest
    )));
  }

  const promise = issue.map(task => {
    return startrek.issueStatusChange(task, status);
  });

  return Promise.all(promise);
}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const startrek = imports.startrek;

  forEach(options.events, event => {
    events.on(event, payload => {
      setIssueStatus(startrek, options, payload, 'review')
        .catch(logger.error.bind(logger));
    });
  });

  return {};

}
