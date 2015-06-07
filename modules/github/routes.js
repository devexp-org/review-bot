var express = require('express'),
    _ = require('lodash'),

    router = express.Router();

const GITHUB_HEADER_EVENT = 'x-github-event';

module.exports = function (github) {
    router.get('/info', function (req, res) {
        res.success('github module');
    });

    router.post('/webhook', function (req, res) {
        if (!_.isPlainObject(req.body)) {
            res.error('req.body is not plain object');
            return;
        }

        switch(req.headers[GITHUB_HEADER_EVENT]) {
            case 'commit_comment':
                github.processCommitComment(req.body);
                break;

            case 'pull_request_review_comment':
                github.processPullRequestReviewComment(req.body);
                break;

            case 'issue_comment':
                github.processIssueComment(req.body);
                break;

            case 'pull_request':
                github.processPullRequest(req.body);
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

    return router;
};
