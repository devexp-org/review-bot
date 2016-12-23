import { Router as router } from 'express';

export default function setup(options, imports) {

  const jabber = imports['notification-jabber'];

  const jabberRouter = router();

  jabberRouter.get('/test/:user', function (req, res) {
    const body = req.query.text;
    const user = req.params.user;

    jabber.send({ login: user }, body || 'Test message');

    res.json('ok');
  });

  return jabberRouter;

}
