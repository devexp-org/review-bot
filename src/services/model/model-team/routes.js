import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http-team');
  const TeamModel = imports.model('team');

  const teamRoute = router();

  teamRoute.post('/add', function (req, res) {
    const name = req.body.name;

    const team = new TeamModel({ name });

    team
      .validate()
      .then(team.save.bind(team))
      .then(res.success.bind(res))
      .catch(err => {
        if (err.name !== 'ValidationError') {
          logger.error(String(err));
        }

        res.error(err);
      });
  });

  teamRoute.get('/get/:name', function (req, res) {
    const name = req.params.name;

    TeamModel
      .findByName(name)
      .then(team => {
        if (!team) {
          return Promise.reject(new Error(
            `Team "${name}" is not found`
          ));
        }

        return team;
      })
      .then(res.success.bind(res))
      .catch(err => {
        logger.error(String(err));
        res.error(err);
      });
  });

  return teamRoute;

}
