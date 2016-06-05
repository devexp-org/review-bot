import * as userModel from '../';

import { userMock } from '../__mocks__/';
import staticModelMock from '../../__mocks__/static';
import schemaModelMock, { virtualMock } from '../../__mocks__/schema';

describe('services/model/user', function () {

  describe('#setupSchema', function () {

    it('should return schema', function () {
      const schema = userModel.setupSchema();

      assert.isObject(schema);
      assert.property(schema, '_id');
      assert.property(schema, 'contacts');
    });

  });

  describe('#setupModel', function () {

    let user, model, loginMock;
    beforeEach(function () {
      user = userMock();

      model = schemaModelMock();

      loginMock = virtualMock();

      model.virtual
        .withArgs('login')
        .returns(loginMock);

      userModel.setupModel('user', model);
    });

    it('should add property "login"', function () {
      assert.calledWith(model.virtual, 'login');

      loginMock.get.callArgOnWith(0, user);
      loginMock.set.callArgOnWith(0, user, 1);
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
