import { find } from 'lodash';
import { Router as router } from 'express';

import {
  NotFoundError,
  UniqueConstraintError
} from '../../../modules/errors';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.model.team');
  const UserModel = imports.model('user');
  const TeamModel = imports.model('team');

  const teamRoute = router();

  function findByName(name, getMembers = false) {
    const method = getMembers ? 'findByNameWithMembers' : 'findByName';

    return TeamModel[method](name)
      .then(team => {
        if (!team) {
          return Promise.reject(new NotFoundError(
            `Team "${name}" is not found`
          ));
        }

        return team;
      });
  }

  function findByLogin(login) {
    return UserModel
      .findByLogin(login)
      .then(user => {
        if (!user) {
          return Promise.reject(
            new NotFoundError(`User "${login}" is not found`)
          );
        }

        return user;
      });
  }

  teamRoute.get('/', function (req, res) {
    const skip = req.query.skip || 0;
    const limit = req.query.limit || 50;

    TeamModel.find({})
      .sort('name')
      .skip(skip)
      .limit(limit)
      .exec()
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.post('/', function (req, res) {
    const team = new TeamModel({
      name: req.body.name,
      driver: req.body.driver,
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

    findByName(id)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.put('/:id', function (req, res) {
    const id = req.params.id;

    findByName(id)
      .then(team => {
        ['name', 'driver', 'patterns'].forEach(param => {
          if (param in req.body) {
            team.set(param, req.body[param]);
          }
        });

        if ('reviewConfig' in req.body) {
          [
            'steps',
            'stepsOptions',
            'notification',
            'approveCount',
            'totalReviewers',
            'setGitHubReviewStatus'
          ].forEach(param => {
            if (param in req.body.reviewConfig) {
              team.set('reviewConfig.' + param, req.body.reviewConfig[param]);
            }
          });
        }

        return team.save();
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.delete('/:id', function (req, res) {
    const id = req.params.id;

    findByName(id)
      .then(team => team.remove())
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.get('/:id/members', function (req, res) {
    const id = req.params.id;

    findByName(id, true)
      .then(team => team.members)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.post('/:id/members', function (req, res) {
    const id = req.params.id;
    const login = req.body.login;

    Promise.all([findByName(id, true), findByLogin(login)])
      .then(([team, user]) => {
        if (find(team.members, { login: user.login })) {
          return Promise.reject(new UniqueConstraintError(
            `"${user.login}" is already member of "${team.name}"`
          ));
        }

        team.members.push(user);

        return team.save();
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  teamRoute.delete('/:id/members', function (req, res) {
    const id = req.params.id;
    const login = req.body.login;

    findByName(id, true)
      .then(team => {
        team.members = team.members.filter(member => member.login !== login);
        return team.save();
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return teamRoute;

}
