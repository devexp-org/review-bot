'use strict';

import middleware from 'badgs/lib/middleware';

import { Router as router } from 'express';

export default function badgeRouterCreator(imports) {
  const badge = imports.badge;
  const badgeRouter = router();

  badgeRouter.use(middleware(badge));

  return badgeRouter;
}
