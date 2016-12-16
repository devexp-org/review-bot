import { forEach } from 'lodash';
import TeamManager from './class';

export default function setup(options, imports) {

  const model = imports.model;

  const drivers = {};

  forEach(options.drivers, (driverName) => {
    const driverModule = imports[driverName];

    if (!driverModule) {
      throw new Error(`Cannot find driver module "${driverName}"`);
    }

    drivers[driverModule.name()] = driverModule;
  });

  return new TeamManager(drivers, model('team'));

}
