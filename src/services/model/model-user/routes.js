import { Router as router } from 'express';

import { NotFoundError } from '../../http/error';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http-user');
  const UserModel = imports.model('user');

  const userRoute = router();

  userRoute.get('/', function (req, res) {
    UserModel.find({}).exec()
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  userRoute.post('/', function (req, res) {
    const user = new UserModel({ login: req.body.login });

    user
      .validate()
      .then(user.save.bind(user))
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  userRoute.get('/:id', function (req, res) {
    const id = req.params.id;

    UserModel
      .findByLogin(id)
      .then(user => {
        if (!user) {
          return Promise.reject(
            new NotFoundError(`User ${id} was not found`)
          );
        }

        return user;
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  userRoute.put('/:id', function (req, res) {
    const id = req.params.id;

    const contacts = req.body.contacts || [];

    UserModel
      .findByLogin(id)
      .then(user => {
        if (!user) {
          return Promise.reject(
            new NotFoundError(`User ${id} was not found`)
          );
        }
        return user;
      })
      .then(user => {
        return user
          .set('contacts', contacts)
          .save();
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  userRoute.delete('/:id', function (req, res) {
    const id = req.params.id;

    UserModel
      .findByLogin(id)
      .then(user => {
        if (!user) {
          return Promise.reject(
            new NotFoundError(`User ${id} was not found`)
          );
        }
        return user;
      })
      .then(user => user.remove())
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return userRoute;

}
