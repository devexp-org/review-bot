import { forEach } from 'lodash';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const teamManager = imports['team-manager'];

  const teamManagerRoute = router();

  teamManagerRoute.get('/drivers', function (req, res) {
    const drivers = {};

    forEach(teamManager.getDrivers(), (factory, name) => {
      drivers[name] = factory.config();
    });

    res.json(drivers);
  });

  return teamManagerRoute;

}
