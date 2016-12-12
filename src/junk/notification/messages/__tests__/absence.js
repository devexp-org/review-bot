import service from '../absence';
import staffMock from '../../../yandex-staff/__mocks__/index';
import eventsMock from '../../../../services/events/__mocks__/index';
import loggerMock from '../../../../services/logger/__mocks__/index';
import { pullRequestMock } from '../../../../services/model/collections/__mocks__/pull-request';

describe('plugins/notification/absence', function () {

  let events, logger, notification, staff, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    staff = staffMock();
    events = eventsMock();
    logger = loggerMock();

    notification = sinon.stub().returns(Promise.resolve());

    pullRequest = pullRequestMock();
    pullRequest.user = { login: 'Thor' };
    pullRequest.review = {
      reviewers: [{ login: 'Black Widow' }, { login: 'Spider-Man' }]
    };

    payload = { pullRequest };

    events.on.callsArgWith(1, payload);

    staff.apiAbsence
      .returns(Promise.resolve([]));
    staff.apiAbsence.withArgs('Black Widow')
      .returns(Promise.resolve([{ staff__login: 'Black Widow' }]));

    options = {};

    imports = { 'yandex-staff': staff, events, logger, notification };

  });

  it('should subscribe to event `review:command:start', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:command:start');
  });

  it('should send message about absence reviewers to author', function (done) {
    service(options, imports);

    setTimeout(() => {
      assert.calledWith(notification, 'Thor');
      done();
    }, 0);
  });

  it('should not send message if there are no absence reviewers', function (done) {
    staff.apiAbsence.withArgs('Black Widow')
      .returns(Promise.resolve([]));

    service(options, imports);

    setTimeout(() => {
      assert.neverCalledWith(notification, 'Thor');
      done();
    }, 0);
  });

  it('should ignore trips', function (done) {
    staff.apiAbsence.withArgs('Black Widow')
      .returns(Promise.resolve([
        { staff__login: 'Black Widow', gap_type__name: 'trip' }
      ]));

    service(options, imports);

    setTimeout(() => {
      assert.neverCalledWith(notification, 'Thor');
      done();
    }, 0);
  });

});
