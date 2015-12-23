import proxyquire from 'proxyquire';

describe('services/http/routes/index', function () {

  let req, res;
  let options, imports, service, middlewere;

  beforeEach(function () {

    req = {};
    res = {
      sendFile: sinon.stub()
    };

    options = {
      assets: './www'
    };
    imports = {};

    const _module = proxyquire('../index', {
      express: {
        Router: function () {
          return {
            use: function (cb) {
              middlewere = cb;
            }
          };
        }
      }
    });

    service = _module.default;
  });

  it('should send index.html', function () {
    service(options, imports);
    middlewere(req, res);

    assert.calledWithMatch(res.sendFile, sinon.match('/www/index.html'));
  });

});
