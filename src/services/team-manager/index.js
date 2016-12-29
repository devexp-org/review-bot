import { forEach } from 'lodash';
import TeamManager from './class';

export default function setup(options, imports) {

  const model = imports.model;

  const drivers = {};

  forEach(options.drivers, (moduleName, driverName) => {
    const driverModule = imports[moduleName];

    if (!driverModule) {
      throw new Error(`Cannot find driver module "${driverName}"`);
    }

    drivers[driverName] = driverModule;
  });

  return new TeamManager(drivers, model('team'));

}
