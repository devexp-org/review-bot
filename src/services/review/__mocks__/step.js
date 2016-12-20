export default function reviewStepMock() {

  return {
    name: sinon.stub().returns('name'),

    config: sinon.stub().returns({}),

    process: sinon.stub()
  };

}
