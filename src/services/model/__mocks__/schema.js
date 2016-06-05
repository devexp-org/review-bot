export function virtualMock() {

  return {
    get: sinon.stub().returnsThis(),
    set: sinon.stub().returnsThis()
  };

}

export default function mock() {

  const model = {
    set: sinon.stub().returnsThis(),
    pre: sinon.stub().returnsThis(),
    path: sinon.stub().returnsThis(),
    virtual: sinon.stub().returns(virtualMock()),
    methods: {},
    statics: {}
  };

  return model;

}
