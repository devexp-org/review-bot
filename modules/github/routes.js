var express = require('express'),
    _ = require('lodash'),

    router = express.Router(),

    GITHUB_EVENT_NAME = 'x-github-event';

router.get('/info', function (req, res) {
    res.send('github module');
});

router.post('/webhook', function (req, res) {
    if (!_.isPlainObject(req.body)) {
        res.status(500).json({
            error: 'req.body is not plain object'
        });
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

        default:
            res.status(500).json({
                error: 'unsupported event type'
            });
            return;
    }

    res.json({
        error: null,
        message: 'got you'
    });
});

module.exports = router;
