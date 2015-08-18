'use strict';

import middleware from 'badgs/lib/middleware';

import { Router as router } from 'express';

export default function badgeRouterCreator(options, imports) {
  const badge = imports['badge-constructor'];
  const badgeRouter = router();

  badgeRouter.use(middleware(badge));

  return Promise.resolve({ service: badgeRouter });
}
