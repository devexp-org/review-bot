import { YandexMultimediaDriverFactory } from '../class';

import teamManagerMock from '../../__mocks__/';
import { teamMock } from '../../../model/model-team/__mocks__/';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';

describe('services/team-manager/driver-yandex-multimedia/class', function () {

  let team, factory, driver, config, staff, pullRequest, manager;

  beforeEach(function () {
    config = { video: 1, images: 2 };

    team = teamMock();

    manager = teamManagerMock();

    staff = yandexStaffMock();

    pullRequest = pullRequestMock();

    factory = new YandexMultimediaDriverFactory(staff);
  });

  it('should be resolved to StaticDriver', function () {
    driver = factory.makeDriver(team, manager, config);

    assert.property(driver, 'getOption');
    assert.property(driver, 'getCandidates');
    assert.property(driver, 'findTeamMember');
  });

  it('should throw an error if `video` or `images` are not given', function () {
    assert.throws(() => factory.makeDriver(team, manager, {}), /not given/);
    assert.throws(() => factory.makeDriver(team, manager, { video: [1] }), /not given/);
    assert.throws(() => factory.makeDriver(team, manager, { images: [1] }), /not given/);
  });

  describe('#getCandidates', function () {

    let users1, users2;

    beforeEach(function () {
      users1 = [{ login: 'foo' }, { login: 'bar' }];
      users2 = [{ login: 'baz' }, { login: 'qux' }];

      staff.getUsersInOffice
        .withArgs(1)
        .returns(Promise.resolve(users1));

      staff.getUsersInOffice
        .withArgs(2)
        .returns(Promise.resolve(users2));

      driver = factory.makeDriver(team, manager, config);
    });

    it('should return people in office for candidates to review', function (done) {
      driver.getCandidates(pullRequest)
        .then(members => assert.deepEqual(members, users1.concat(users2)))
        .then(done, done);
    });

    it('should accept groupId as array', function (done) {
      config = { video: [1], images: [2] };

      driver = factory.makeDriver(team, manager, config);

      driver.getCandidates(pullRequest)
        .then(members => assert.deepEqual(members, users1.concat(users2)))
        .then(done, done);
    });

    it('should return members from images team if title has `IMAGESUI` text', function (done) {
      pullRequest.title = 'IMAGESUI-1: HOTFIX';

      const expected = [
        { login: 'baz', mmTeam: 'images' },
        { login: 'qux', mmTeam: 'images' }
      ];

      driver.getCandidates(pullRequest)
        .then(actual => assert.deepEqual(actual, expected))
        .then(done, done);
    });

    it('should return members from video team if title has `VIDEOUI` text', function (done) {
      pullRequest.title = 'VIDEOUI-1: codestyle';

      const expected = [
        { login: 'foo', mmTeam: 'video' },
        { login: 'bar', mmTeam: 'video' }
      ];

      driver.getCandidates(pullRequest)
        .then(users => assert.deepEqual(users, expected))
        .then(done, done);
    });

  });

  describe.skip('#findTeamMember', function () {

    it('should search user in staff', function (done) {
      const fooUser = { login: 'foo' };

      driver = factory.makeDriver(team, manager, config);

      staff.apiUserInfo
        .withArgs('foo')
        .returns(Promise.resolve(fooUser));

      staff._addAvatarAndUrl
        .returnsArg(0);

      driver.findTeamMember('foo')
        .then(user => assert.deepEqual(user, fooUser))
        .then(done, done);
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      assert.isObject(factory.config());
    });

  });

});
