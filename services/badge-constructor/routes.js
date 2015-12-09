'use strict';

import middleware from 'badgs/lib/middleware';

import Badgs from 'badgs';
import { Router as router } from 'express';

export default function badgeRouterCreator(options, imports) {

  const badge = new Badgs(options.template);
  const badgeRouter = router();

  badgeRouter.use(middleware(badge));

  return badgeRouter;
}
