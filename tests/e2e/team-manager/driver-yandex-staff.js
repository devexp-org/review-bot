import { merge, withApp } from '../app';
import { withModel } from '../model/';
import { withTeamModel } from '../model/model-team';
import { withPullRequestModel } from '../model/model-pull-request';
import { withTeamManager } from '../team-manager/';
import secret from '../../../config/secret';

export function withTeamDriverYandexStaff(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-manager': {
          options: {
            drivers: {
              'yandex-staff': 'team-driver-yandex-staff'
            }
          },
          dependencies: [
            'team-driver-yandex-staff'
          ]
        },
        'team-driver-yandex-staff': {
          path: './src/services/team-manager/driver-yandex-staff',
          dependencies: [
            'yandex-staff'
          ]
        },
        'yandex-staff': {
          path: './src/plugins/yandex-staff',
          options: {
            cache: { getGroupMembers: 86400 },
            center_url: 'https://center.yandex-team.ru/api/v1/',
            jabber_url: 'https://center.yandex-team.ru/jabber/status-bulk/'
          }
        }
      }
    }, config);

    config.services['yandex-staff'] = merge(
      config.services['yandex-staff'],
      secret.services['yandex-staff']
    );

    next(imports => {
      const TeamModel = imports.model('team');

      return TeamModel
        .findByName('test-team').then(team => {
          team.set({
            driver: {
              name: 'yandex-staff',
              options: { groupId: 57769 }
            },
            patterns: ['artems/devkit']
          });

          return team.save();
        })
        .then(team => {
          imports.team = team;
          return imports;
        })
        .then(test);

    }, config, done);

  };

}

describe('services/team-manager/driver-yandex-staff', function () {

  const test = withTeamDriverYandexStaff(
    withTeamManager(
      withTeamModel(
        withPullRequestModel(
          withModel(
            withApp
          )
        )
      )
    )
  );

  describe('#getCandidates', function () {

    it('should get candidates using YandexStaff API', function (done) {

      test(imports => {
        const manager = imports['team-manager'];
        const pullRequest = imports.pullRequest;

        return manager.findTeamByPullRequest(pullRequest)
          .then(teamDriver => {
            return teamDriver.getCandidates();
          })
          .then(candidates => {
            assert.sameMembers(
              candidates.map(x => x.login),
                ['artems', 'd4rkr00t', 'mishanga', 'sbmaxx']
            );
          });
      }, {}, done);

    });

  });

});
