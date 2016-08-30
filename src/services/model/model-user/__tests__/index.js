import { isFunction } from 'lodash';

import service, * as userModel from '../';

import { userMock } from '../__mocks__/';
import staticModelMock from '../../../model/__mocks__/static';
import schemaModelMock from '../../../model/__mocks__/schema';

describe('services/model/model-user', function () {

  it('should be able to setup model', function () {
    const obj = service();

    assert.property(obj, 'baseSchema');
    assert.property(obj, 'setupModel');
  });

  describe('#baseSchema', function () {

    it('the mock object should have the same properties', function () {
      const mock = userMock();
      const schema = userModel.baseSchema();

      const properties = Object.keys(mock);

      properties
        .filter(property => isFunction(property))
        .forEach(property => assert.property(schema, property));
    });

  });

  describe('#setupModel', function () {

    let user, model;

    beforeEach(function () {
      user = userMock();

      model = schemaModelMock();

      userModel.setupModel('user', model);
    });

    it('should add method "getContacts"', function () {
      assert.property(model.methods, 'getContacts');
      assert.isFunction(model.methods.getContacts);
    });

    it('should add static method "findByLogin"', function () {
      const staticMock = staticModelMock();

      assert.property(model.statics, 'findByLogin');
      assert.isFunction(model.statics.findByLogin);

      model.statics.findByLogin.call(staticMock, 'user');
    });

    describe('#getContacts', function () {

      it('should return user contacts', function () {
        user.contacts = [{ type: 'skype' }];
        const result = model.methods.getContacts.call(user);

        assert.deepEqual(result, [{ type: 'skype' }]);
      });

      it('should return an empty array if user has no contacts', function () {
        user.contacts = null;
        assert.deepEqual(model.methods.getContacts.call(user), []);
      });

    });

  });

});
