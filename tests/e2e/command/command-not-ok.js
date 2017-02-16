import { cloneDeep } from 'lodash';
import { merge, withApp, withInitial } from '../app';
import { withCommand } from '../command';
import { withModelSuite } from '../model';
import { withTeamManagerSuite } from '../team-manager';
import { withPullRequestReview } from '../pull-request-review';

import issueCommentHook from '../data/issue_comment_webhook';

export function withCommandNotOk(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          options: {
            commands: { 'not-ok': 'command-not-ok' }
          },
          dependencies: [
            'command-not-ok'
          ]
        },
        'command-not-ok': {
          path: './src/services/command/command-not-ok',
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

describe('services/command/command-not-ok', function () {

  const test = withCommandNotOk(
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

  it('should set status of review to `changesneeded`', function (done) {

    test(imports => {
      const payload = cloneDeep(issueCommentHook);

      const events = imports.events;
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      payload.pullRequest = pullRequest;
      payload.comment.body = '/!ok';
      payload.comment.user.login = 'foo';

      return events
        .emitAsync('github:issue_comment', payload)
        .then(() => PullRequestModel.findById(pullRequest.id))
        .then(pullRequestLoaded => {
          const review = pullRequestLoaded.get('review');
          assert.equal(review.status, 'changesneeded');
        });
    }, {}, done);

  });

});
