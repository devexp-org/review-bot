import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http-user');
  const UserModel = imports.model('user');

  const userRoute = router();

  userRoute.all('/add', function (req, res) {
    const login = req.body.login || req.query.login;

    const user = new UserModel({ login });

    user
      .validate()
      .then(user.save.bind(user))
      .then(res.success.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  userRoute.get('/get/:login', function (req, res) {
    const login = req.params.login;

    UserModel
      .findByLogin(login)
      .then(user => {
        if (!user) {
          return Promise.reject(new Error(
            `User "${login}" is not found`
          ));
        }

        return user;
      })
      .then(res.success.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  userRoute.get('/list', function (req, res) {
    UserModel
      .find({}, 'login')
      .then(res.success.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return userRoute;

}
