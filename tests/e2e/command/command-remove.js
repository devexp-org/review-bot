import { cloneDeep } from 'lodash';
import { merge, withApp, withInitial } from '../app';
import { withCommand } from '../command';
import { withModelSuite } from '../model';
import { withTeamManagerSuite } from '../team-manager';
import { withPullRequestReview } from '../pull-request-review';

import issueCommentHook from '../data/issue_comment_webhook';

export function withCommandRemove(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          options: {
            commands: { remove: 'command-remove' }
          },
          dependencies: [
            'command-remove'
          ]
        },
        'command-remove': {
          path: './src/services/command/command-remove',
          dependencies: [
            'events',
            'logger',
            'pull-request-review'
          ]
        }
      }
    });

    next(test, config, done);

  };

}

describe('services/command/command-remove', function () {

  const test = withCommandRemove(
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

  it('should remove a reviewer', function (done) {

    test(imports => {
      const payload = cloneDeep(issueCommentHook);

      const events = imports.events;
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      payload.pullRequest = pullRequest;
      payload.comment.body = '/remove foo';

      pullRequest.review.reviewers.push({ login: 'bar' });

      return pullRequest.save()
        .then(() => events.emitAsync('github:issue_comment', payload))
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
