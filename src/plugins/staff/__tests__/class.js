import Staff from '../class';

describe('plugins/staff/class', function () {
  let staff, got;

  const centerUrl = 'http://www.example.com/';

  beforeEach(function () {
    got = sinon.stub();

    got.callsArgWith(2, null, {});
  });

  describe('#request', function () {

    beforeEach(function () {
      staff = new Staff(got, {
        center_url: centerUrl,
        fields: { absence: ['login', 'trip'] },
        cache: { apiAbsence: 60 }
      });
    });

    it('should cache result', function (done) {
      staff.apiAbsence('user1')
        .then(() => staff.apiAbsence('user1'))
        .then(() => assert.calledOnce(got))
        .then(done, done);
    });

    it('should not cache result if set option to `0`', function (done) {
      staff = new Staff(got, {
        center_url: centerUrl,
        fields: { absence: ['login', 'trip'] },
        cache: { apiAbsence: 0 }
      });

      staff.apiAbsence('user1')
        .then(() => staff.apiAbsence('user1'))
        .then(() => assert.calledTwice(got))
        .then(done, done);
    });

    it('should drop cache item when it expires', function (done) {
      const clock = sinon.useFakeTimers();

      staff.apiAbsence('user1')
        .then(() => clock.tick(60 * 1000 * 2))
        .then(() => staff.apiAbsence('user1'))
        .then(() => assert.calledTwice(got))
        .then(() => clock.restore())
        .then(done, done);
    });

    it('should reject promise if request return an error', function (done) {
      got.callsArgWith(2, new Error('request error'), {});

      staff.apiAbsence('user1')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /request error/))
        .then(done, done);
    });

  });

  describe('#apiAbsence', function () {

    beforeEach(function () {
      staff = new Staff(got, {
        center_url: centerUrl,
        fields: { absence: ['login', 'trip'] }
      });

      got.callsArgWith(2, null, {});
    });

    it('should make the right request', function (done) {
      staff.apiAbsence('user1')
        .then(() => {
          const url = 'http://www.example.com/absence_by_user/user1.json';
          assert.calledWithMatch(got, url, { query: { fields: 'login|trip' } });
        })
        .then(done, done);
    });

    it('should get fields from options', function (done) {
      staff = new Staff(got, { center_url: centerUrl, fields: {} });

      staff.apiAbsence('user1')
        .then(() => {
          const url = 'http://www.example.com/absence_by_user/user1.json';
          assert.calledWithMatch(got, url, { query: { fields: null } });
        })
        .then(done, done);
    });

  });

  describe('#apiUserInfo', function () {

    beforeEach(function () {
      staff = new Staff(got, {
        center_url: centerUrl,
        fields: { info: ['login', 'lastname'] }
      });

      got.callsArgWith(2, null, {});
    });

    it('should make the right request', function (done) {
      staff.apiUserInfo(['user1', 'user2'])
        .then(() => {
          const url = 'http://www.example.com/user/user1|user2.json';
          assert.calledWithMatch(got, url, { query: { fields: 'login|lastname' } });
        })
        .then(done, done);
    });
  });

  describe('#apiUserWhere', function () {

    beforeEach(function () {
      staff = new Staff(got, {
        center_url: centerUrl,
        fields: { where: ['login', 'is_vpn'] }
      });

      got.callsArgWith(2, null, {});
    });

    it('should make the right request', function (done) {
      staff.apiUserWhere('user1')
        .then(() => {
          const url = 'http://www.example.com/user/user1/where.json';
          assert.calledWithMatch(got, url, { query: { fields: 'login|is_vpn' } });
        })
        .then(done, done);
    });
  });

  describe('#apiJabberStatus', function () {
    const jabberUrl = 'http://www.example.com/';

    beforeEach(function () {
      staff = new Staff(got, { jabber_url: jabberUrl });

      got.callsArgWith(2, null, {});
    });

    it('should make the right request', function (done) {
      staff.apiJabberStatus('user1')
        .then(() => {
          const url = 'http://www.example.com/';

          assert.calledWithMatch(got, url, { query: { login: 'user1' } });
        })
        .then(done, done);
    });
  });

  describe('#apiGroupMembers', function () {

    beforeEach(function () {
      staff = new Staff(got, {
        center_url: centerUrl,
        fields: { group: ['login'] }
      });

      got.callsArgWith(2, null, {});
    });

    it('should make the right request', function (done) {
      staff.apiGroupMembers(12345)
        .then(() => {
          const url = 'http://www.example.com/groups/12345/all_members';

          assert.calledWithMatch(got, url, { query: { fields: 'login' } });
        })
        .then(done, done);
    });
  });

  describe('#getUsers', function () {

    beforeEach(function () {
      staff = new Staff(got, { center_url: centerUrl });

      got.callsArgWith(2, null, {});

      sinon.stub(staff, 'apiGroupMembers').returns(Promise.resolve([
        { login: 'user1' },
        { login: 'user2' },
        { login: 'user3' }
      ]));

      sinon.stub(staff, 'apiUserInfo').returns(Promise.resolve([
        { login: 'user2', first_name: 'B' },
        { login: 'user3', first_name: 'C' },
        { login: 'user1', first_name: 'A' }
      ]));

      sinon.stub(staff, 'apiUserWhere').returns(Promise.resolve([
        { staff__login: 'user2', is_vpn: true },
        { staff__login: 'user3', is_vpn: false },
        { staff__login: 'user1', is_vpn: true }
      ]));

      sinon.stub(staff, 'apiAbsence').returns(Promise.resolve([
        { staff__login: 'user2', trip: false },
        { staff__login: 'user3', trip: false },
        { staff__login: 'user1', trip: true }
      ]));

      sinon.stub(staff, 'apiJabberStatus').returns(Promise.resolve({
        user1: { status: 'online' },
        user2: { status: 'away' },
        user3: { status: 'dnd' }
      }));
    });

    afterEach(function () {
      staff.apiAbsence.restore();
      staff.apiGroupMembers.restore();
      staff.apiJabberStatus.restore();
      staff.apiUserInfo.restore();
      staff.apiUserWhere.restore();
    });

    it('should return users with additional information', function (done) {
      staff.getUsers(12345)
        .then(users => {
          assert.deepEqual(
            users,
            [
              {
                login: 'user1',
                first_name: 'A',
                avatar_url: '//center.yandex-team.ru/api/v1/user/user1/avatar/100.jpg',
                html_url: 'https://staff.yandex-team.ru/user1',
                where: { staff__login: 'user1', is_vpn: true },
                absence: { staff__login: 'user1', trip: true },
                jabber: { status: 'online' }
              },
              {
                login: 'user2',
                first_name: 'B',
                avatar_url: '//center.yandex-team.ru/api/v1/user/user2/avatar/100.jpg',
                html_url: 'https://staff.yandex-team.ru/user2',
                where: { staff__login: 'user2', is_vpn: true },
                absence: { staff__login: 'user2', trip: false },
                jabber: { status: 'away' }
              },
              {
                login: 'user3',
                first_name: 'C',
                avatar_url: '//center.yandex-team.ru/api/v1/user/user3/avatar/100.jpg',
                html_url: 'https://staff.yandex-team.ru/user3',
                where: { staff__login: 'user3', is_vpn: false },
                absence: { staff__login: 'user3', trip: false },
                jabber: { status: 'dnd' }
              }
            ]
          );
        })
        .then(done, done);
    });

    it('should accept array of groups', function (done) {
      let users1, users2;

      staff.getUsers(12345)
        .then(users => {
          users1 = users;
          return staff.getUsers([12345]);
        })
        .then(users => {
          users2 = users;
        })
        .then(() => assert.deepEqual(users1, users2))
        .then(done, done);
    });

  });

  describe('#getUsersInOffice', function () {

    let resultUsers;

    beforeEach(function () {
      staff = new Staff(got, {
        center_url: centerUrl,
        fields: { group: ['login'] }
      });

      resultUsers = [
        { login: 'user1' },
        { login: 'user2', absence: { gap_type__name: 'trip', right_edge: +new Date() - 100 } },
        { login: 'user3', absence: { gap_type__name: 'holiday', right_edge: +new Date() + 100 } }
      ];

      sinon.stub(staff, 'getUsers').returns(Promise.resolve(resultUsers));
    });

    it('should return presence users', function (done) {
      staff.getUsersInOffice()
        .then(users => assert.deepEqual(users, [resultUsers[0], resultUsers[1]]))
        .then(done, done);
    });
  });

  describe('#_addAvatarAndUrl', function () {
    let user1;

    beforeEach(function () {
      staff = new Staff(got, { center_url: centerUrl });

      user1 = {
        login: 'user1',
        first_name: 'A',
        where: { staff__login: 'user1', is_vpn: true },
        absence: { staff__login: 'user1', trip: true },
        jabber: { status: 'online' }
      };
    });

    it('should add avatar_url and html_url properties to user object', function () {
      const result = staff._addAvatarAndUrl(user1);

      assert.equal(result.html_url, 'https://staff.yandex-team.ru/user1');
      assert.equal(result.avatar_url, '//center.yandex-team.ru/api/v1/user/user1/avatar/100.jpg');
    });

  });

});
