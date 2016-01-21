import proxyquire from 'proxyquire';

describe('services/http/routes/favicon', function () {

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

    const _module = proxyquire('../favicon', {
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

  it('should send favicon.ico', function () {
    service(options, imports);
    middlewere(req, res);

    assert.calledWithMatch(res.sendFile, sinon.match('/www/favicon.ico'));
  });

});
