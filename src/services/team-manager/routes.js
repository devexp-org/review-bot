import { forEach } from 'lodash';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.team-manager');
  const teamManager = imports['team-manager'];

  const teamManagerRoute = router();

  teamManagerRoute.get('/drivers', function (req, res) {
    const drivers = {};

    forEach(teamManager.getDrivers(), (factory) => {
      drivers[factory.name()] = factory.config();
    });

    res.json(drivers);
  });

  teamManagerRoute.post('/sync-team/', function (req, res) {
    const teamName = req.body.team;

    teamManager.getDriver(teamName)
      .then(driver => driver.getCandidates().then(() => 'ok'))
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return teamManagerRoute;

}
