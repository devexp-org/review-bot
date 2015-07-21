import _ from 'lodash';
import { Router } from 'express';

import review from './review';
import saveReview from './actions/save';
import approveReview from './actions/approve';
import * as models from 'app/modules/models';

const router = Router(); // eslint-disable-line new-cap
const PullRequest = models.get('PullRequest');

router.get('/info', (req, res) => {
    res.success('review api routes');
});

router.get('/reviews/:username', (req, res) => {
    PullRequest
        .findByReviewer(req.params.username)
        .then(reviews => {
            if (_.isEmpty(reviews)) {
                res.error('Reviews not found!');
            } else {
                res.success(reviews);
            }
        });
});

router.get('/reviewers/choose/:id', (req, res) => {
    review(req.params.id).then(
        res.success.bind(res),
        res.error.bind(res)
    );
});

router.post('/save', (req, res) => {
    saveReview(req.body.review, req.body.id)
        .then(() => { res.success('review saved'); })
        .catch(error => res.error(error));
});

router.post('/approve', (req, res) => {
    approveReview(req.body.user.login, req.body.id)
        .then(() => { res.success('review approved'); })
        .catch(error => res.error(error));
});

export default router;
