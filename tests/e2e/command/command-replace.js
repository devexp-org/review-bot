import { cloneDeep } from 'lodash';
import { merge, withApp, withInitial } from '../app';
import { withCommand } from '../command';
import { withModelSuite } from '../model';
import { withReviewSuite } from '../review';
import { withTeamManagerSuite } from '../team-manager';
import { withPullRequestReview } from '../pull-request-review';

import issueCommentHook from '../data/issue_comment_webhook';

export function withCommandReplace(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          options: {
            commands: { replace: 'command-replace' }
          },
          dependencies: [
            'command-replace'
          ]
        },
        'command-replace': {
          path: './src/services/command/command-replace',
          dependencies: [
            'events',
            'logger',
            'review',
            'team-manager',
            'pull-request-review'
          ]
        }
      }
    });

    next(test, config, done);

  };

}

describe('services/command/command-replace', function () {

  const test = withCommandReplace(
    withCommand(
      withReviewSuite(
        withPullRequestReview(
          withTeamManagerSuite(
            withModelSuite(
              withInitial(
                withApp
              )
            )
          )
        )
      )
    )
  );

  it('should replace an author of issue comment', function (done) {

    test(imports => {
      const payload = cloneDeep(issueCommentHook);

      const events = imports.events;
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      payload.pullRequest = pullRequest;
      payload.comment.body = '/replace foo';
      payload.comment.user.login = 'bar';

      return events
        .emitAsync('github:issue_comment', payload)
        .then(() => PullRequestModel.findById(pullRequest.id))
        .then(pullRequestLoaded => {
          const reviewers = pullRequestLoaded.get('review.reviewers');
          assert.lengthOf(reviewers, 1);
          assert.isObject(reviewers[0]);
          assert.equal(reviewers[0].login, 'bar');
        });
    }, {}, done);

  });

});
