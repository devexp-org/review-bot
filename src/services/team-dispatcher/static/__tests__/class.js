import StaticTeam from '../class';

describe('services/team-dispatcher/static/class', function () {

  let group, team;
  beforeEach(function () {
    group = [{ login: 'a' }, { login: 'b' }];

    team = new StaticTeam(group);
  });

  it('should return team members', function (done) {
    team.getMembersForReview()
      .then(result => assert.deepEqual(result, group))
      .then(done, done);
  });

  it('should return a clone of members', function (done) {
    team.getMembersForReview()
      .then(result => assert.notEqual(result, group))
      .then(done, done);
  });

  it('should throws an error if members are not given', function () {
    assert.throws(() => new StaticTeam());
  });

  it('should throws error if members is an empty array', function () {
    assert.throws(() => new StaticTeam([]));
  });

});
