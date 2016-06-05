import { userModelMock } from '../user/__mocks__/';
import { pullRequestModelMock } from '../pull-request/__mocks__/';

export default function mock() {

  const model = sinon.stub();

  model
    .withArgs('user')
    .returns(userModelMock());

  model
    .withArgs('pull_request')
    .returns(pullRequestModelMock());

  return model;

}
