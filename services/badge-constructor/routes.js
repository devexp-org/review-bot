'use strict';

import path from 'path';
import { Router as router } from 'express';

const specialChar7 = String.fromCharCode(7);
const specialChar8 = String.fromCharCode(8);
const specialChar7RE = new RegExp(specialChar7, 'g');
const specialChar8RE = new RegExp(specialChar8, 'g');

export function decode(str) {
  return str
    .replace(/--/g, specialChar7)
    .replace(/__/g, specialChar8)
    .split('-')
    .map(x => x.replace(/_/g, ' '))            // replace _  to space
    .map(x => x.replace(specialChar7RE, '-'))  // replace -- to -
    .map(x => x.replace(specialChar8RE, '_')); // replace __ to _
}

export function handleRequest(badge) {

  return function (req, res, next) {
    const url = req.url;

    if (path.extname(url) === '.svg') {

      const query = url.substr(1).slice(0, -4);
      const parts = decode(decodeURIComponent(query));
      const image = badge.render(parts[0], parts[1], parts[2]);

      res.setHeader('content-type', 'image/svg+xml;charset=utf-8');
      res.send(image);

    } else {
      next();
    }
  }

}

export default function badgeRouterCreator(imports) {
  const badge = imports.badge;
  const badgeRouter = router();

  badgeRouter.get('*', handleRequest(badge));

  return badgeRouter;
}
