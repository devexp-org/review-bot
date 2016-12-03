import { instanceMock } from '../../../model/__mocks__/schema';

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

  return instanceMock(team);

}

export function teamModelMock() {

  const team = teamMock();

  const stub = sinon.stub().returns(team);

  stub.find = sinon.stub().returns(Promise.resolve(null));
  stub.findById = sinon.stub().returns(Promise.resolve(null));
  stub.findByName = sinon.stub().returns(Promise.resolve(null));
  stub.findByNameWithMembers = sinon.stub().returns(Promise.resolve(null));

  return stub;

}
