import { Router as router } from 'express';

import { NotFoundError } from '../../http/error';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.model.team');
  const TeamModel = imports.model('team');

  const teamRoute = router();

  teamRoute.get('/', function (req, res) {
    TeamModel.find({}).exec()
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.post('/', function (req, res) {
    const team = new TeamModel({
      name: req.body.name,
      reviewConfig: req.body.reviewConfig
    });

    team
      .validate()
      .then(team.save.bind(team))
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.get('/:id', function (req, res) {
    const id = req.params.id;

    TeamModel
      .findByName(id)
      .then(team => {
        if (!team) {
          return Promise.reject(
            new NotFoundError(`Team was not found (${id})`)
          );
        }

        return team;
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.put('/:id', function (req, res) {
    const id = req.params.id;

    const name = req.body.name || '';
    const reviewConfig = req.body.reviewConfig || {};

    TeamModel
      .findByName(id)
      .then(team => {
        if (!team) {
          return Promise.reject(
            new NotFoundError(`Team was not found (${id})`)
          );
        }
        return team;
      })
      .then(team => {
        return team
          .set('name', name)
          .set('reviewConfig', reviewConfig)
          .save();
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.delete('/:id', function (req, res) {
    const id = req.params.id;

    TeamModel
      .findByName(id)
      .then(team => {
        if (!team) {
          return Promise.reject(
            new NotFoundError(`Team was not found (${id})`)
          );
        }
        return team;
      })
      .then(team => team.remove())
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return teamRoute;

}
