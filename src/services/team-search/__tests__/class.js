import UserSearch from '../class';

import searchDriverMock from '../search-abstract/__mocks__/';

describe('services/team-search/class', function () {

  let search, driver;

  beforeEach(function () {
    driver = searchDriverMock();
    search = new UserSearch({ driver }, 'driver');
  });

  describe('#getDrivers', function () {

    it('should return all drivers', function () {
      assert.deepEqual(search.getDrivers(), { driver });
    });

  });

  describe('#findByLogin', function () {

    it('should search user by using `default` driver', function () {
      search.findByLogin('foo');

      assert.calledWith(driver.findByLogin, 'foo');
    });

    it('should search user by using given driver', function () {
      const driver1 = searchDriverMock();
      const driver2 = searchDriverMock();

      search = new UserSearch({ driver1, driver2 }, 'driver1');

      search.findByLogin('foo', 'driver2');

      assert.notCalled(driver1.findByLogin);
      assert.calledWith(driver2.findByLogin, 'foo');
    });

  });

});
