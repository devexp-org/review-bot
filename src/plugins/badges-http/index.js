import Badgs from 'badgs';
import middleware from 'badgs/lib/middleware';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const badge = new Badgs(options.template);

  const badgeRouter = router();

  badgeRouter.use(middleware(badge));

  badgeRouter.get('/', function (req, res) {
    res.send('ok').end();
  });

  return badgeRouter;

}
