import StaticSearch from '../class';

import { userModelMock } from '../../../model/model-user/__mocks__/';

describe('services/team-search/search-static/class', function () {

  let search, UserModel;

  beforeEach(function () {
    UserModel = userModelMock();

    search = new StaticSearch(UserModel);
  });

  describe('#findByLogin', function () {

    it('should search user in database', function (done) {

      search.findByLogin('octocat')
        .then(() => assert.calledWith(UserModel.findByLogin, 'octocat'))
        .then(done, done);

    });

  });

});
