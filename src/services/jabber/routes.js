import { Router as router } from 'express';

export default function setup(options, imports) {

  const jabber = imports.jabber;

  const jabberRouter = router();

  jabberRouter.get('/test/:user', function (req, res) {
    const user = req.params.user;

    jabber.send(user, 'Test message');

    res.ok('ok');
  });

  return jabberRouter;

}
