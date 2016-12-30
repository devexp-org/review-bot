import { forEach } from 'lodash';
import Notification from './class';

/**
 * Notification service
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {

  const teamManager = imports['team-manager'];

  const transports = {};

  forEach(options.transports, (moduleName, transportName) => {
    const transportModule = imports[moduleName];

    if (!transportModule) {
      throw new Error(`Cannot find transport module "${transportName}"`);
    }

    transports[transportName] = transportModule;
  });

  return new Notification(transports, teamManager);

}
