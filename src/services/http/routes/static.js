import path from 'path';
import { static as _static, Router as router } from 'express';

export default function setup(options, imports) {

  if (!options.assets) {
    throw new Error('Required parameter "assets" is not given');
  }

  const assetsPath = path.resolve(options.assets);

  const staticRouter = router();

  staticRouter.use(_static(assetsPath));

  staticRouter.use((req, res) => {
    res.sendStatus(404).end();
  });

  return staticRouter;

}
