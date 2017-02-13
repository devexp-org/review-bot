import schedule from 'node-schedule';
import { forEach } from 'lodash';

import TeamSync from './class';

export default function setup(options, imports) {

  const model = imports.model;
  const UserModel = model('user');
  const TeamModel = model('team');
  const teamManager = imports['team-manager'];

  const date = options.schedule || '0 0 2 * * *'; // every day at 02:00:00 am
  const drivers = {};

  forEach(options.drivers, (moduleName, driverName) => {
    const driverModule = imports[moduleName];

    if (!driverModule) {
      throw new Error(`Cannot find driver module "${moduleName}"`);
    }

    drivers[driverName] = driverModule;
  });

  const sync = new TeamSync(drivers, UserModel, TeamModel);

  return new Promise(resolve => {

    const task = schedule.scheduleJob('team-sync', date, () => {
      return teamManager.getTeams()
        .then(items => {
          return Promise.all(items.map(team => sync.syncTeam(team.name)));
        });
    });

    sync.shutdown = () => {
      task.cancel();
      return Promise.resolve();
    };

    resolve(sync);

  });

}
