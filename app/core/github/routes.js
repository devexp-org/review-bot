import { Router } from 'express';
import _ from 'lodash';
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
            res.error('unsupported event type');
            return;
    }

    res.success('got you');
});

export default router;
