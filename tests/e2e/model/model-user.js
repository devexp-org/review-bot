import { merge } from '../app';
import { withModel } from '../model';

export function withUserCollection(test, config, done) {

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

  withModel(imports => {

    let user;
    const UserModel = imports.model('user');

    return UserModel
      .remove({})
      .then(() => {
        user = new UserModel();

        user.set({
          login: 'testuser',
          html_url: 'https://github.com/testuser',
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

}

describe('services/model-class/user', function () {

  it('should setup user model', function (done) {

    withUserCollection(imports => {
      const user = imports.user;
      assert.equal(user._id, user.login);
    }, {}, done);

  });

  describe('#findByLogin', function () {

    it('should return user filtered by login', function (done) {

      withUserCollection(imports => {
        const UserModel = imports.UserModel;

        return Promise.resolve()
          .then(() => UserModel.findByLogin('testuser'))
          .then(result => assert.equal(result.login, 'testuser'));
      }, {}, done);

    });

    it('should return null if user was not found', function (done) {

      withUserCollection(imports => {
        const UserModel = imports.UserModel;

        return Promise.resolve()
          .then(() => UserModel.findByLogin('non-existent-user'))
          .then(result => assert.isNull(result));
      }, {}, done);

    });

  });

});

