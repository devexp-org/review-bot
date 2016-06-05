import Team from '../team';

describe('services/team-dispatcher/team', function () {

  let team;
  beforeEach(function () {
    team = new Team();
  });

  describe('#getMembersForReview', function () {

    it('should be resolved to an empty array', function (done) {
      team.getMembersForReview()
        .then(members => {
          assert.isArray(members);
          assert.lengthOf(members, 0);
        })
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should find member by login', function (done) {
      sinon.stub(team, 'getMembersForReview')
        .returns(Promise.resolve(
          [
            { id: 1, login: 'a' },
            { id: 2, login: 'b' },
            { id: 3, login: 'c' }
          ]
        ));

      team.findTeamMember(null, 'b')
        .then(member => assert.deepEqual(member, { id: 2, login: 'b' }))
        .then(done, done);
    });

  });

  describe('#getOption', function () {

    it('should return team option', function () {
      team = new Team({ foo: 'bar' });

      assert.equal(team.getOption('foo'), 'bar');
    });

    it('should return default option if team option is undefined', function () {
      team = new Team({ foo: 'bar' });

      assert.equal(team.getOption('bar', 'baz'), 'baz');
    });

  });

});

