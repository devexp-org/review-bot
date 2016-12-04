import { get } from 'lodash';

export default function mock() {

  return {
    add: sinon.stub().returnsThis(),
    set: sinon.stub().returnsThis(),
    pre: sinon.stub().returnsThis(),
    path: sinon.stub().returnsThis(),
    virtual: sinon.stub().returns(virtualMock()),
    methods: {},
    statics: {}
  };

}

export function virtualMock() {

  return {
    get: sinon.stub().returnsThis(),
    set: sinon.stub().returnsThis()
  };

}

export function instanceMock(obj, mixin) {

  obj.get = function () {};
  obj.set = sinon.stub().returnsThis();
  obj.save = sinon.stub().returns(Promise.resolve(obj));
  obj.remove = sinon.stub().returns(Promise.resolve(obj));
  obj.validate = sinon.stub().returns(Promise.resolve(obj));

  sinon.stub(obj, 'get', function (path) {
    return get(this, path);
  });

  if (mixin) {
    mixin(obj);
  }

  return obj;

}
