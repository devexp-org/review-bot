import { cloneDeep } from 'lodash';
import { merge, withApp, withInitial } from '../app';
import { withCommand } from '../command';
import { withModelSuite } from '../model';
import { withTeamManagerSuite } from '../team-manager';
import { withPullRequestReview } from '../pull-request-review';

import issueCommentHook from '../data/issue_comment_webhook';

export function withCommandRestart(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          options: {
            commands: { restart: 'command-restart' }
          },
          dependencies: [
            'command-restart'
          ]
        },
        'command-restart': {
          path: './src/services/command/command-restart',
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

describe('services/command/command-restart', function () {

  const test = withCommandRestart(
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

  it('should reset a review status', function (done) {

    test(imports => {
      const payload = cloneDeep(issueCommentHook);

      const events = imports.events;
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      payload.pullRequest = pullRequest;
      payload.comment.body = '/restart';
      payload.comment.user.login = 'artems';

      pullRequest.review.status = 'complete';
      pullRequest.review.reviewers[0].approved = true;

      return pullRequest.save()
        .then(() => events.emitAsync('github:issue_comment', payload))
        .then(() => PullRequestModel.findById(pullRequest.id))
        .then(pullRequestLoaded => {
          const review = pullRequestLoaded.get('review');
          assert.equal(review.status, 'inprogress');
          assert.isFalse(review.reviewers[0].approved);
        });
    }, {}, done);

  });

});
