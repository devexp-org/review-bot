import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.team-sync');
  const teamSync = imports['team-sync'];

  const teamSyncRoute = router();

  teamSyncRoute.get('/sync', function (req, res) {
    const teamName = req.body.teamName || req.query.teamName;

    teamSync.syncTeam(teamName)
      .then(() => res.json({ status: 'ok' }))
      .catch(res.handleError.bind(res, logger));
  });

  return teamSyncRoute;

}
