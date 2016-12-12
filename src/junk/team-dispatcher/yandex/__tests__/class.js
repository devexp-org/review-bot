import YandexTeam from '../class';

import staffMock from '../../../../plugins/yandex-staff/__mocks__/index';
import { pullRequestMock } from
'../../../../services/model/collections/__mocks__/pull-request';

describe('plugins/team-dispatcher/yandex/class', function () {

  let team, staff, groupId, options, pullRequest;

  beforeEach(function () {

    staff = staffMock();
    groupId = 1;
    options = {};

    pullRequest = pullRequestMock();

    team = new YandexTeam(staff, groupId, options);

  });

  describe('#getMembersForReview', function () {

    it('should return people in office for members for review', function (done) {
      const users = [{ login: 'foo' }, { login: 'bar' }];

      staff.getUsersInOffice
        .withArgs(groupId)
        .returns(Promise.resolve(users));

      team.getMembersForReview()
        .then(members => assert.deepEqual(members, users))
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should search user in yandex staff', function (done) {
      const fooUser = { login: 'foo' };

      staff.apiUserInfo
        .withArgs('foo')
        .returns(Promise.resolve(fooUser));

      staff._addAvatarAndUrl
        .returnsArg(0);

      team.findTeamMember(pullRequest, 'foo')
        .then(user => assert.deepEqual(user, fooUser))
        .then(done, done);

    });

  });

});
