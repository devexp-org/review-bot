import { merge, withApp, withInitial } from '../app';
import { withModel } from '../model';

export function withUserModel(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        model: {
          options: {
            models: {
              user: 'model-user'
            }
          },
          dependencies: ['model-user']
        },
        'model-user': {
          path: './src/services/model/model-user'
        }
      }
    }, config);

    next(imports => {

      let user;
      const UserModel = imports.model('user');

      return UserModel
        .remove({})
        .then(() => {
          user = new UserModel();

          user.set({
            login: 'test-user',
            html_url: 'https://github.com/test-user',
            avatar_url: 'https://avatars.githubusercontent.com/u/19480?v=3'
          });

          return user.save();
        })
        .then(() => {
          imports.user = user;
          imports.UserModel = UserModel;

          return imports;
        })
        .then(test);

    }, config, done);

  };

}

describe('services/model/model-user', function () {

  const test = withUserModel(withModel(withInitial(withApp)));

  it('should setup user model', function (done) {

    test(imports => {
      const user = imports.user;
      const UserModel = imports.UserModel;

      assert.property(user, 'getContacts');
      assert.property(UserModel, 'findByLogin');

    }, {}, done);

  });

  describe('#findByLogin', function () {

    it('should return user filtered by login', function (done) {

      test(imports => {
        const UserModel = imports.UserModel;

        return Promise.resolve()
          .then(() => UserModel.findByLogin('test-user'))
          .then(result => assert.equal(result.login, 'test-user'));
      }, {}, done);

    });

    it('should return null if user was not found', function (done) {

      test(imports => {
        const UserModel = imports.UserModel;

        return Promise.resolve()
          .then(() => UserModel.findByLogin('non-existent-user'))
          .then(result => assert.isNull(result));
      }, {}, done);

    });

  });

});

