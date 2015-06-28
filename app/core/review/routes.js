import { Router } from 'express';
import review from './review';
import saveReview from './actions/save_review.js';

var router = Router(),
    counter = 1;

router.get('/info', function reviewInfoRoute(req, res) {
    res.success('review api routes');
});

router.get('/reviewers/choose/:id', function chooseReviewersRoute(req, res) {
    review(req.params.id).then(
        (reviewResults) => res.success(reviewResults),
        (err) => res.err(err)
    );
});

router.post('/review', function saveReviewRoute(req, res) {
    saveReview(req.body).then(
        () => res.success('review saved'),
        (err) => res.err(err)
    );
});

export default router;
