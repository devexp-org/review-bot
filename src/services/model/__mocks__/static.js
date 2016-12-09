export default function mock() {
  const statics = staticMock();

  return { model: sinon.stub().returns(statics) };
}

export function staticMock(obj) {
  const statics = sinon.stub().returns(obj);

  statics.find = sinon.stub().returnsThis();
  statics.sort = sinon.stub().returnsThis();
  statics.skip = sinon.stub().returnsThis();
  statics.limit = sinon.stub().returnsThis();
  statics.select = sinon.stub().returnsThis();
  statics.populate = sinon.stub().returnsThis();

  statics.exec = sinon.stub().returns(Promise.resolve(null));

  statics.findOne = sinon.stub().returnsThis();
  statics.findById = sinon.stub().returns(Promise.resolve(null));

  return statics;
}
