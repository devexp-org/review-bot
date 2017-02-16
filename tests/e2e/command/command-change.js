import { cloneDeep } from 'lodash';
import { merge, withApp, withInitial } from '../app';
import { withCommand } from '../command';
import { withModelSuite } from '../model';
import { withTeamManagerSuite } from '../team-manager';
import { withPullRequestReview } from '../pull-request-review';

import issueCommentHook from '../data/issue_comment_webhook';

export function withCommandChange(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          options: {
            commands: { change: 'command-change' }
          },
          dependencies: [
            'command-change'
          ]
        },
        'command-change': {
          path: './src/services/command/command-change',
          dependencies: [
            'events',
            'logger',
            'team-manager',
            'pull-request-review'
          ]
        }
      }
    });

    next(test, config, done);

  };

}

describe('services/command/command-change', function () {

  const test = withCommandChange(
    withCommand(
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
  );

  it('should change an author of issue comment', function (done) {

    test(imports => {
      const payload = cloneDeep(issueCommentHook);

      const events = imports.events;
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      payload.pullRequest = pullRequest;
      payload.comment.body = '/change foo to bar';
      payload.comment.user.login = 'foo';

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
