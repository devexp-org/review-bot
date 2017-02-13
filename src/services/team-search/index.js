import { forEach } from 'lodash';
import UserSearch from './class';

export default function setup(options, imports) {

  const drivers = {};

  forEach(options.drivers, (moduleName, driverName) => {
    const driverModule = imports[moduleName];

    if (!driverModule) {
      throw new Error(`Cannot find driver module "${moduleName}"`);
    }

    drivers[driverName] = driverModule;
  });

  if (!options.defaultDriver) {
    throw new Error('Default search driver is not set');
  }

  if (!(options.defaultDriver in drivers)) {
    throw new Error(`Default driver "${options.defaultDriver}" is not found`);
  }

  return new UserSearch(drivers, options.defaultDriver);

}
