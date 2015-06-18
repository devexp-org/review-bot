import { Router } from 'express';
import review from './review';

var router = Router();

router.get('/info', function reviewInfoRouter(req, res) {
    res.success('review api routes');
});

router.get('/reviewers/choose/:id', function chooseReviewersRoute(req, res) {
    review(req.params.id).then(
        (reviewResults) => res.success(reviewResults),
        (err) => res.err(err)
    );
});

export default router;
