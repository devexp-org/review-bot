import { forEach } from 'lodash';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.team-sync');
  const teamSync = imports['team-sync'];

  const teamSyncRoute = router();

  teamSyncRoute.put('/sync', function (req, res) {
    const teamName = req.body.teamName;

    teamSync.syncTeam(teamName)
      .then(() => res.json({ status: 'ok' }))
      .catch(res.handleError.bind(res, logger));
  });

  teamSyncRoute.get('/drivers', function (req, res) {
    const drivers = {};

    forEach(teamSync.getDrivers(), (factory, name) => {
      drivers[name] = factory.config();
    });

    res.json(drivers);
  });

  return teamSyncRoute;

}
