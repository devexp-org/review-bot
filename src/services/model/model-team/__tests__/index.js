import { isFunction } from 'lodash';

import service, * as teamModel from '../';

import { teamMock } from '../__mocks__/';
import staticModelMock from '../../../model/__mocks__/static';
import schemaModelMock from '../../../model/__mocks__/schema';

describe('services/model/model-team', function () {

  it('should be able to setup model', function () {
    const obj = service();

    assert.property(obj, 'baseSchema');
    assert.property(obj, 'setupModel');
  });

  describe('#baseSchema', function () {

    it('the mock object should have the same properties', function () {
      const mock = teamMock();
      const schema = teamModel.baseSchema();

      const properties = Object.keys(mock);

      properties
        .filter(property => isFunction(property))
        .forEach(property => assert.property(schema, property));
    });

  });

  describe('#setupModel', function () {

    let model;

    beforeEach(function () {
      model = schemaModelMock();

      teamModel.setupModel('team', model);
    });

    it('should add static method "findByName"', function () {
      const staticMock = staticModelMock();

      assert.property(model.statics, 'findByName');
      assert.isFunction(model.statics.findByName);

      model.statics.findByName.call(staticMock, 'team');
    });

    it('should add static method "findByNameWithMembers"', function () {
      const staticMock = staticModelMock();

      assert.property(model.statics, 'findByNameWithMembers');
      assert.isFunction(model.statics.findByNameWithMembers);

      model.statics.findByNameWithMembers.call(staticMock, 'team');
    });

  });

});
