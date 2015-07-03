import { Router } from 'express';
import _ from 'lodash';

import { PullRequest } from 'app/core/models';

import processCommitComment from 'app/core/github/webhook/process_commit_comment';
import processPullRequestReviewComment from 'app/core/github/webhook/process_pull_request_review_comment';
import processIssueComment from 'app/core/github/webhook/process_issue_comment';
import processPullRequest from 'app/core/github/webhook/process_pull_request';

const GITHUB_HEADER_EVENT = 'x-github-event';

var router = Router();

router.get('/info', function githubInfoRouter(req, res) {
    res.success('github api routes');
});

router.post('/webhook', function (req, res) {
    if (!_.isPlainObject(req.body)) {
        res.error('req.body is not plain object');
        return;
    }

    switch(req.headers[GITHUB_HEADER_EVENT]) {
        case 'commit_comment':
            processCommitComment(req.body);
            break;

        case 'pull_request_review_comment':
            processPullRequestReviewComment(req.body);
            break;

        case 'issue_comment':
            processIssueComment(req.body);
            break;

        case 'pull_request':
            processPullRequest(req.body);
            break;

        case 'ping':
            res.success('pong');
            return;

        default:
            res.error('Unsupported event type');
            return;
    }

    res.success('got you');
});

router.get('/pulls/:username', function (req, res) {
    PullRequest
        .find()
        .sort({ updated_at: -1 })
        .exec()
        .then(function (pullRequests) {
            if (_.isEmpty(pullRequests)) {
                res.error('Pull Requests not found!');
            } else {
                res.success(pullRequests);
            }
        });
});

router.get('/pull/:id', function (req, res) {
    PullRequest
        .findById(req.params.id)
        .then(function (pullRequest) {
            if (_.isEmpty(pullRequest)) {
                res.error(`Pull Request with id = ${req.params.id} not found!`);
            } else {
                res.success(pullRequest);
            }
        });
});

export default router;
