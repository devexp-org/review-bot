import StaffTeam from '../class';

import staffMock from '../../staff/__mocks__/';
import { pullRequestMock } from
  '../../../services/model/pull-request/__mocks__/';

describe('plugins/team-dispatcher/staff/class', function () {

  let team, staff, groupId, options, pullRequest;

  beforeEach(function () {

    staff = staffMock();
    groupId = 1;
    options = {};

    pullRequest = pullRequestMock();

    team = new StaffTeam(staff, groupId, options);

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

    it('should search user in staff', function (done) {
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
