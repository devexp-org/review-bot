import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http-user');
  const UserModel = imports.model('user');

  const userRoute = router();

  userRoute.get('/by-login/:login', function (req, res) {
    const login = req.params.login;

    UserModel
      .findByLogin(login)
      .then(user => {
        if (!user) {
          return Promise.reject(new Error(
            `User ${login} is not found`
          ));
        }

        return user;
      })
      .then(res.success.bind(res))
      .catch(err => {
        res.error(err.message);
        logger.error(err);
      });
  });

  return userRoute;

}
