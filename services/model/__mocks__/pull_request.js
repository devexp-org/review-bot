export default function () {

  let pull, promise;

  pull = {};

  promise = Promise.resolve(pull);

  pull.get = sinon.stub();
  pull.set = sinon.stub().returnsThis();
  pull.save = sinon.stub().returns(promise);

  return pull;

}
