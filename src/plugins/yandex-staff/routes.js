import { Router as router } from 'express';

export default function setup(options, imports) {

  const staff = imports['yandex-staff'];

  const staffRouter = router();

  staffRouter.get('/group/:id', function (req, res) {
    const id = req.params.id;

    staff.getUsers(id).then(users => res.json(users));
  });

  staffRouter.get('/absence/:user', function (req, res) {
    const user = req.params.user;

    staff.apiAbsence(user).then(absence => res.json(absence));
  });

  return staffRouter;

}
