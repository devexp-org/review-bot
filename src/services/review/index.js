import { forEach } from 'lodash';
import Review from './class';

export default function setup(options, imports) {

  const steps = {};
  const logger = imports.logger.getLogger('review');
  const teamManager = imports['team-manager'];

  forEach(options.steps, (stepName) => {
    const stepModule = imports[stepName];

    if (!stepModule) {
      throw new Error(`Cannot find step module "${stepName}"`);
    }

    steps[stepModule.name()] = stepModule;
  });

  return new Review(steps, { logger, teamManager });

}
