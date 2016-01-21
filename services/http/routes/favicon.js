'use strict';

import path from 'path';
import { Router as router } from 'express';

export default function (options, imports) {

  const assetsPath = path.join(__dirname, '../../..', options.assets || '.');

  const faviconRouter = router();

  faviconRouter.use(function (req, res) {
    res.sendFile(path.join(assetsPath, 'favicon.ico'));
  });

  return faviconRouter;

}
