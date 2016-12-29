import { forEach } from 'lodash';
import Review from './class';

export default function setup(options, imports) {

  const steps = {};
  const logger = imports.logger.getLogger('review');
  const teamManager = imports['team-manager'];

  forEach(options.steps, (moduleName, stepName) => {
    const stepModule = imports[moduleName];

    if (!stepModule) {
      throw new Error(`Cannot find step module "${stepName}"`);
    }

    steps[stepName] = stepModule;
  });

  return new Review(steps, options, { logger, teamManager });

}
