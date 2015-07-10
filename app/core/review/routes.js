var Router = require('express').Router;
var _ = require('lodash');
var router = Router();

var PullRequest = require('app/core/models').PullRequest;

var review = require('./review');
var saveReview = require('./actions/save');
var approveReview = require('./actions/approve');

router.get('/info', function reviewInfoRoute(req, res) {
    res.success('review api routes');
});

router.get('/reviews/:username', function suggestReviewersRoute(req, res) {
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
        res.success.bind(res),
        res.error.bind(res)
    );
});

router.post('/save', function saveReviewRoute(req, res) {
    saveReview(req.body.review, req.body.id).then(
        function () { res.success('review saved'); },
        res.error.bind(res)
    );
});

router.post('/approve', function saveReviewRoute(req, res) {
    approveReview(req.body.user.login, req.body.id).then(
        function () { res.success('review approved'); },
        res.error.bind(res)
    );
});

module.exports = router;
