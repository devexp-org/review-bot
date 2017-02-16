import { cloneDeep } from 'lodash';
import { merge, withApp, withInitial } from '../app';
import { withCommand } from '../command';
import { withModelSuite } from '../model';
import { withTeamManagerSuite } from '../team-manager';
import { withPullRequestReview } from '../pull-request-review';

import issueCommentHook from '../data/issue_comment_webhook';

export function withCommandStop(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          options: {
            commands: { stop: 'command-stop' }
          },
          dependencies: [
            'command-stop'
          ]
        },
        'command-stop': {
          path: './src/services/command/command-stop',
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

describe('services/command/command-stop', function () {

  const test = withCommandStop(
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

  it('should set status of review to `notstarted`', function (done) {

    test(imports => {
      const payload = cloneDeep(issueCommentHook);

      const events = imports.events;
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      payload.pullRequest = pullRequest;
      payload.comment.body = '/stop';
      payload.comment.user.login = 'artems';
      pullRequest.review.status = 'inprogress';

      return pullRequest.save()
        .then(() => events.emitAsync('github:issue_comment', payload))
        .then(() => PullRequestModel.findById(pullRequest.id))
        .then(pullRequestLoaded => {
          const review = pullRequestLoaded.get('review');
          assert.equal(review.status, 'notstarted');
        });
    }, {}, done);

  });

});
