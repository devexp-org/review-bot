import service from '../';
import { isFunction } from 'lodash';
import { pullRequestMock } from '../__mocks__/';

import staticModelMock from '../../../model/__mocks__/static';
import schemaModelMock, { virtualMock } from '../../../model/__mocks__/schema';

describe('services/model/model-pull-request', function () {

  it('should be able to setup model', function () {
    const obj = service();

    assert.property(obj, 'baseSchema');
    assert.property(obj, 'setupModel');
  });

  describe('#baseSchema', function () {

    it('the mock object should have the same properties', function () {
      const mock = pullRequestMock();
      const schema = service().baseSchema();

      const properties = Object.keys(mock);

      properties
        .filter(property => isFunction(property))
        .forEach(property => assert.property(schema, property));
    });

  });

  describe('#setupModel', function () {

    let model, pullRequest, ownerMock;

    beforeEach(function () {
      model = schemaModelMock();

      ownerMock = virtualMock();

      model.virtual
        .withArgs('owner')
        .returns(ownerMock);

      pullRequest = pullRequestMock();

      service().setupModel('pull_request', model);
    });

    it('should add property "owner"', function () {
      ownerMock.get.callArgOnWith(0, pullRequest);
    });

    it('should add method "toString"', function () {
      assert.property(model.methods, 'toString');
      assert.isFunction(model.methods.toString);
    });

    describe('#toString', function () {

      it('should convert pullRequest to string', function () {
        assert.equal(model.methods.toString.call(pullRequest), '[1 – title] html_url');
      });

    });

    describe('#owner', function () {

      it('should return pullRequest owner', function () {
        ownerMock.get.callArgOnWith(0, pullRequest);
      });

      it('should return an empty string if owner is not set', function () {
        pullRequest.repository = {};

        ownerMock.get.callArgOnWith(0, pullRequest);
      });

    });

    it('should add static method "findById"', function () {
      const staticMock = staticModelMock();

      assert.property(model.statics, 'findById');
      assert.isFunction(model.statics.findById);

      model.statics.findById.call(staticMock, '1234567890');
    });

    it('should add static method "findByUser"', function () {
      const staticMock = staticModelMock();

      assert.property(model.statics, 'findByUser');
      assert.isFunction(model.statics.findByUser);

      model.statics.findByUser.call(staticMock, 'user');
    });

    it('should add static method "findByRepositoryAndNumber"', function () {
      const staticMock = staticModelMock();

      assert.property(model.statics, 'findByRepositoryAndNumber');
      assert.isFunction(model.statics.findByRepositoryAndNumber);

      model.statics.findByRepositoryAndNumber.call(staticMock, 'test/test', 1);
    });

  });

});
