import service from '../';

import modelMock from '../../../model/__mocks__/';
import { userModelMock } from '../../../model/model-user/__mocks__/';

describe('services/team-search/search-static', function () {

  let options, imports, search, model, UserModel;

  beforeEach(function () {
    model = modelMock();

    UserModel = userModelMock();

    options = {};
    imports = { model };

    model.withArgs('user').returns(UserModel);
  });

  it('should be resolved to AbstractUserSearch', function () {
    search = service(options, imports);

    assert.property(search, 'findByLogin');
  });

});
