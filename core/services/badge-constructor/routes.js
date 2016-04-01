'use strict';

import Badgs from 'badgs';
import middleware from 'badgs/lib/middleware';
import { Router as router } from 'express';

/**
 * Creator adds middleware to render badges.
 * It parses urls like `/subject-status-color` and then sends a svg image using parsed data.
 */
export default function badgeRouterCreator(options, imports) {

  const badge = new Badgs(options.template);
  const badgeRouter = router();

  badgeRouter.use(middleware(badge));

  return badgeRouter;
}
