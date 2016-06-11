import util from 'util';
import { map, forEach } from 'lodash';

/**
 * Updates tags field in startrek with components from pull request.
 *
 * @param {Object} startrek
 * @param {Object} components
 * @param {Object} options
 * @param {Object} payload
 *
 * @return {Promise}
 */
export function setIssueComponents(startrek, components, options, payload) {
  const { pullRequest } = payload;
  const issue = startrek.parseIssue(pullRequest.title, options.queues);

  if (!issue.length) {
    return Promise.reject(new Error(util.format(
      'Cannot find issue in pull request %s', pullRequest.toString()
    )));
  }

  const files = map(pullRequest.files, 'filename');

  return components
    .getResponsibles(null, { files }, 3600 * 24)
    .then(responsibles => {
      return responsibles.map(component => component.codeName);
    })
    .then(tags => {
      const promise = issue.map(task => {
        return startrek.issueUpdate(task, { tags: { add: tags } });
      });

      return Promise.all(promise);
    });
}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const startrek = imports.startrek;
  const components = imports['components-api'];

  forEach(options.events, event => {
    events.on(event, payload => {
      setIssueComponents(startrek, components, options, payload)
        .catch(logger.error.bind(logger));
    });
  });

  return {};

}
