import service from '../';

import { reviewMock } from '../../__mocks__/';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/absence', function () {

  let step, members, staff, pullRequest, options, imports;

  beforeEach(function () {

    staff = yandexStaffMock();

    members = reviewMock();

    options = { list: ['Captain America', 'Hulk', 'Thor'] };

    imports = { 'yandex-staff': staff };

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';

    step = service({}, imports);

    staff.apiAbsence.returns(Promise.resolve([
      { staff__login: 'Black Widow' },
      { staff__login: 'Captain America' },
      { staff__login: 'Hawkeye' }
    ]));

  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should remove candidates which are absence', function (done) {
    const review = { members, pullRequest };

    const expected = [
      'Hulk',
      'Iron Man',
      'Spider-Man',
      'Thor'
    ];

    step.process(review, options)
      .then(actual => {
        assert.sameDeepMembers(actual.members.map(x => x.login), expected);
      })
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step.process(review, options)
      .then(actual => assert.deepEqual(actual.members, []))
      .then(done, done);
  });

});
