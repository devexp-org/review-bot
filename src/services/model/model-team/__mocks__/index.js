import { get } from 'lodash';

export function teamMock() {

  const team = {
    name: 'name',
    members: [],
    reviewConfig: {
      steps: [
        { name: 'load', options: { max: 5 } }
      ],
      approveCount: 2,
      totalReviewers: 2
    }
  };

  team.get = function () {};
  team.set = sinon.stub().returnsThis();
  team.save = sinon.stub().returns(Promise.resolve(team));

  sinon.stub(team, 'get', function (path) {
    return get(this, path);
  });

  return team;

}

export function teamModelMock() {

  const team = teamMock();

  const stub = sinon.stub().returns(team);

  stub.findByName = sinon.stub().returns(Promise.resolve(null));
  stub.findByNameWithMembers = sinon.stub().returns(Promise.resolve(null));

  return stub;

}
