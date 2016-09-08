import { Router as router } from 'express';

import { NotFoundError } from '../error';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http-user');
  const UserModel = imports.model('user');

  const userRoute = router();

  userRoute.get('/', function (req, res) {
    UserModel
      .find({})
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
            new NotFoundError(`User was not found (${id})`)
          );
        }

        return user;
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return userRoute;

}
