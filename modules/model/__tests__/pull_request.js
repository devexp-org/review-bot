'use strict';

import * as pullRequest from '../../model/pull_request';

describe('modules/model/pull_request', function () {

  describe('#setupSchema', function () {

    it('should return schema', function () {
      const schema = pullRequest.setupSchema();

      assert.isObject(schema);
      assert.property(schema, '_id');
    });

  });

  describe('#setupModel', function () {

    let model;

    beforeEach(function () {

      model = {
        set: sinon.stub().returnsThis(),
        path: sinon.stub().returnsThis(),
        statics: {}
      };

      model.set.callsArgOnWith(0, model, 123456789);

      pullRequest.setupModel('pull_request', model);
    });

    it('should set _id as id', function () {
      assert.equal(model._id, 123456789);
      assert.calledWith(model.path, 'id');
    });

  });

});
