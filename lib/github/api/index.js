var express = require('express'),
    _ = require('lodash'),
    github = require('../'),
    router = express.Router();

var GITHUB_EVENT_NAME = 'x-github-event';

router.get('/pull', function(req, res) {
    github.pullRequests.getAll({
            user: 'devexp-org',
            repo: 'devexp',
            state: 'open'
    }, function(err, data) {
        res.json(data);
    });
});

//module.exports.commitComment = require('./commit_comment.js');
router.post('/webhook', function(req, res) {
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
            break;
    }
    // commit_comment
    // pull_request_review_comment
    // issue_comment
    // pull_request
    console.log("event: %s, action: %s, title: %s", req.headers['x-github-event'], 
        req.body.action, req.body.pull_request.title);
    if (!_.isPlainObject(req.body)) {
        res.status(500).json({
            error: 'req.body is not plain object'
        });
    } else {
        res.json({
            error: null,
            message: 'got you'
        });
    }
});

module.exports = router;
