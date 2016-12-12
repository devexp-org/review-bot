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

  const teamManager = new TeamManager(drivers, model('user'), model('team'));

  const timer = setTimeout(() => teamManager.sync(), 1000 * 3600 * 60);
  timer.unref();

  return teamManager;
}
