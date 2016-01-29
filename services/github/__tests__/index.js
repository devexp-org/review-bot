import service from '../../github';

describe('services/github', function () {

  it('should be resolved to GitHub', function () {

    const options = {
      version: '3.0.0'
    };

    const github = service(options);

    assert.property(github, 'repos');
    assert.property(github, 'pullRequests');

  });

  it('should authenticate to GitHub if credentials is provided', function () {
    const options = {
      version: '3.0.0',
      authenticate: {
        type: 'token',
        token: '1234567890abcde'
      }
    };

    const github = service(options);
    assert.isObject(github);

  });

});
