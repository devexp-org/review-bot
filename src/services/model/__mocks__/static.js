export default function mock() {

  const statics = {
    find: sinon.stub().returnsThis(),
    sort: sinon.stub().returnsThis(),
    skip: sinon.stub().returnsThis(),
    limit: sinon.stub().returnsThis(),

    exec: sinon.stub().returns(Promise.resolve(null)),

    findOne: sinon.stub().returnsThis(),
    findById: sinon.stub().returns(null)
  };

  const model = {
    model: sinon.stub().returns(statics)
  };

  return model;

}
