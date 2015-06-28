import { Router } from 'express';
import review from './review';
import saveReview from './actions/save_review';
import approveReview from './actions/approve_review';

var router = Router();

router.get('/info', function reviewInfoRoute(req, res) {
    res.success('review api routes');
});

router.get('/reviewers/choose/:id', function chooseReviewersRoute(req, res) {
    review(req.params.id).then(
        (reviewResults) => res.success(reviewResults),
        (err) => res.err(err)
    );
});

router.post('/save', function saveReviewRoute(req, res) {
    saveReview(req.body).then(
        () => res.success('review saved'),
        (err) => res.err(err)
    );
});

router.post('/approve', function saveReviewRoute(req, res) {
    approveReview(req.body).then(
        () => res.success('review approved'),
        (err) => res.err(err)
    );
});

export default router;
