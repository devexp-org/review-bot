import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import notificationMock from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';

describe('plugins/notification/absence', function () {

  let events, logger, notification, staff, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();
    staff = yandexStaffMock();

    notification = notificationMock();

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
      assert.calledWith(notification.sendMessage, pullRequest, 'Thor');
      done();
    }, 0);
  });

  it('should not send message if there are no absence reviewers', function (done) {
    staff.apiAbsence.withArgs('Black Widow')
      .returns(Promise.resolve([]));

    service(options, imports);

    setTimeout(() => {
      assert.neverCalledWith(notification.sendMessage, pullRequest, 'Thor');
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
      assert.neverCalledWith(notification.sendMessage, pullRequest, 'Thor');
      done();
    }, 0);
  });

});
