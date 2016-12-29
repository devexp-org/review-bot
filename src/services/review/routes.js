import { forEach } from 'lodash';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const review = imports.review;

  const reviewRoute = router();

  reviewRoute.get('/steps', function (req, res) {
    const steps = {};

    forEach(review.getSteps(), (step, name) => {
      steps[name] = step.config();
    });

    res.json(steps);
  });

  return reviewRoute;

}
