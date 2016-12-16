import { Router as router } from 'express';

import { NotFoundError } from '../../../modules/errors';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.model.user');
  const UserModel = imports.model('user');

  const userRoute = router();

  function findByLogin(id) {
    return UserModel
      .findByLogin(id)
      .then(user => {
        if (!user) {
          return Promise.reject(
            new NotFoundError(`User "${id}" is not found`)
          );
        }

        return user;
      });
  }

  userRoute.get('/', function (req, res) {
    UserModel.find({}).limit(50).exec()
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

    findByLogin(id)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  userRoute.put('/:id', function (req, res) {
    const id = req.params.id;
    const contacts = req.body.contacts || [];

    findByLogin(id)
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

    findByLogin(id)
      .then(user => user.remove())
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return userRoute;

}
