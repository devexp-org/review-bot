import { Router } from 'express';
import _ from 'lodash';

import { PullRequest } from 'app/core/models';

import review from './review';
import saveReview from './actions/save_review';
import approveReview from './actions/approve_review';

var router = Router();

router.get('/info', function reviewInfoRoute(req, res) {
    res.success('review api routes');
});

router.get('/reviews/:username', function chooseReviewersRoute(req, res) {
    PullRequest
        .findByReviewer(req.params.username)
        .then(function (reviews) {
            if (_.isEmpty(reviews)) {
                res.error('Reviews not found!');
            } else {
                res.success(reviews);
            }
        });
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
