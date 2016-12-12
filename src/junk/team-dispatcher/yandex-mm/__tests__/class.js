import YandexMMStaffTeam from '../class';

import teamMock from '../../../../services/team-dispatcher/__mocks__/team';
import staffMock from '../../../yandex-staff/__mocks__/index';
import { pullRequestMock } from
  '../../../../services/model/collections/__mocks__/pull-request';

describe('plugins/team-dispatcher/yandex-mm/class', function () {

  let team, staff, groupId, teams, pullRequest;
  beforeEach(function () {
    staff = staffMock();

    teams = {
      image: teamMock(),
      video: teamMock()
    };

    teams.image.groupId = [2];
    teams.video.groupId = [3];

    groupId = [1];

    pullRequest = pullRequestMock();

    staff.getUsersInOffice.returns(Promise.resolve([{ login: 'foo' }]));

    team = new YandexMMStaffTeam(staff, groupId, teams);
  });

  describe('#getMembersForReview', function () {

    it('should return users from image team if title has `IMAGESUI` text', function (done) {

      const expected = [{ login: 'foo', mmTeam: 'image', groupId: 2 }];
      pullRequest.title = 'IMAGESUI-1: fix';

      team.getMembersForReview(pullRequest)
        .then(users => assert.deepEqual(users, expected))
        .then(done, done);

    });

    it('should return users from image team if title has `VIDEOUI` text', function (done) {

      const expected = [{ login: 'foo', mmTeam: 'video', groupId: 3 }];
      pullRequest.title = 'VIDEOUI-1: fix';

      team.getMembersForReview(pullRequest)
        .then(users => assert.deepEqual(users, expected))
        .then(done, done);

    });

  });

});
