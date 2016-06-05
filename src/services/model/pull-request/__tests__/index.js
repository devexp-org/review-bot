import * as pullRequestModel from '../';

import { pullRequestMock } from '../__mocks__/';
import staticModelMock from '../../__mocks__/static';
import schemaModelMock, { virtualMock } from '../../__mocks__/schema';

describe('services/model/pull-request', function () {

  describe('#setupSchema', function () {

    it('should return schema', function () {
      const schema = pullRequestModel.setupSchema();

      assert.isObject(schema);
      assert.property(schema, '_id');
      assert.property(schema, 'number');
    });

  });

  describe('#setupModel', function () {

    let model, pullRequest, idMock, ownerMock;
    beforeEach(function () {
      model = schemaModelMock();

      idMock = virtualMock();
      ownerMock = virtualMock();

      model.virtual
        .withArgs('id')
        .returns(idMock);

      model.virtual
        .withArgs('owner')
        .returns(ownerMock);

      pullRequest = pullRequestMock();

      pullRequestModel.setupModel('pull_request', model);
    });

    it('should add property "id"', function () {
      idMock.get.callArgOnWith(0, pullRequest);
      idMock.set.callArgOnWith(0, pullRequest, 1);
    });

    it('should add property "owner"', function () {
      ownerMock.get.callArgOnWith(0, pullRequest);
    });

    it('should add the method "toString"', function () {
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

    describe('', function () {

      let staticMock;
      beforeEach(function () {
        staticMock = staticModelMock();
      });

      it('should add static method "findByUser"', function () {
        assert.property(model.statics, 'findByUser');
        assert.isFunction(model.statics.findByUser);

        model.statics.findByUser.call(staticMock, 'user');
      });

      it('should add static method "findByRepositoryAndNumber"', function () {
        assert.property(model.statics, 'findByRepositoryAndNumber');
        assert.isFunction(model.statics.findByRepositoryAndNumber);

        model.statics.findByRepositoryAndNumber.call(staticMock, 'user');
      });

    });

  });

});
