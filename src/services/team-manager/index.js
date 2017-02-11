import { forEach } from 'lodash';
import TeamManager from './class';

export default function setup(options, imports) {

  const model = imports.model;
  const search = imports[options.search];

  const drivers = {};

  if (!search) {
    throw new Error(`Cannot find search module "${options.search}"`);
  }

  forEach(options.drivers, (moduleName, driverName) => {
    const driverModule = imports[moduleName];

    if (!driverModule) {
      throw new Error(`Cannot find driver module "${moduleName}"`);
    }

    drivers[driverName] = driverModule;
  });

  return new TeamManager(model('team'), drivers, search);

}
