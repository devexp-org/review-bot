import { staticMock } from '../../../model/__mocks__/static';
import { instanceMock } from '../../../model/__mocks__/schema';

export function teamMock(mixin) {
  const team = {
    name: 'name',
    members: [],
    patterns: [],
    driver: {
      name: 'static',
      options: {}
    },
    reviewConfig: {
      steps: [
        { name: 'load', options: { max: 5 } }
      ],
      approveCount: 2,
      totalReviewers: 3
    }
  };

  return instanceMock(team, mixin);
}

export function teamModelMock(mixinSchema, mixinModel) {
  const team = teamMock(mixinSchema);
  const stub = staticMock(team, mixinModel);

  stub.findByName = sinon.stub().returns(Promise.resolve(null));
  stub.findByNameWithMembers = sinon.stub().returns(Promise.resolve(null));

  return stub;
}
