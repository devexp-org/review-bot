var express = require('express'),
    _ = require('lodash'),

    router = express.Router(),

    GITHUB_EVENT_NAME = 'x-github-event';

router.get('/info', function (req, res) {
    res.success('github module');
});

router.post('/webhook', function (req, res) {
    if (!_.isPlainObject(req.body)) {
        res.error('req.body is not plain object');
        return;
    }

    switch(req.headers[GITHUB_EVENT_NAME]) {
        case 'commit_comment':
            break;

        case 'pull_request_review_comment':
            break;

        case 'issue_comment':
            break;

        case 'pull_request':
            break;

        case 'ping':
            res.success('pong');
            return;

        default:
            res.error('unsupported event type');
            return;
    }

    res.success('got you');
});

module.exports = router;
