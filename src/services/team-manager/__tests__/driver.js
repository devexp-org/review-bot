import DefaultDriver from '../driver';

describe('services/team-manager/driver', function () {

  let driver, frontend;

  beforeEach(function () {
    driver = new DefaultDriver();
    frontend = driver.makeDriver({});
  });

  describe('#getMembersForReview', function () {

    it('should be resolved to array', function (done) {
      frontend.getMembersForReview()
        .then(members => {
          assert.isArray(members);
          assert.lengthOf(members, 0);
        })
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should find member by login', function (done) {
      sinon.stub(frontend, 'getMembersForReview')
        .returns(Promise.resolve([
          { id: 1, login: 'a' },
          { id: 2, login: 'b' },
          { id: 3, login: 'c' }
        ]));

      frontend.findTeamMember(null, 'b')
        .then(member => assert.deepEqual(member, { id: 2, login: 'b' }))
        .then(done, done);
    });

  });

  describe('#getOption', function () {

    let team;

    beforeEach(function () {
      team = { name: 'team', reviewConfig: { foo: 'bar' }, members: [] };
      frontend = driver.makeDriver(team);
    });

    it('should return team option', function () {
      assert.equal(frontend.getOption('foo'), 'bar');
    });

    it('should return default option if team option is undefined', function () {
      assert.equal(frontend.getOption('bar', 'baz'), 'baz');
    });

  });

});

