import { decode, handleRequest } from '../routes';

describe('services/badge-costructor', function () {

  describe('#decode', function () {

    it('should split into chunks by `-`', function () {
        assert.deepEqual(decode('foo-bar-baz'), ['foo', 'bar', 'baz']);
    });

    describe('should replace `_` to space', function () {

      it('... at the begining', function () {
        assert.deepEqual(decode('_foobar'), [' foobar']);
      });

      it('... at the end', function () {
        assert.deepEqual(decode('foobar_'), ['foobar ']);
      });

      it('... in the middle', function () {
        assert.deepEqual(decode('foo_bar'), ['foo bar']);
      })

    });

    describe('should replace `--` to `-`', function () {

      it('... at the begining', function () {
        assert.deepEqual(decode('--foobar'), ['-foobar']);
      });

      it('... at the end', function () {
        assert.deepEqual(decode('foobar--'), ['foobar-']);
      });

      it('... in the middle', function () {
        assert.deepEqual(decode('foo--bar'), ['foo-bar']);
      })

    });

    describe('should replace `__` to `_`', function () {

      it('... at the begining', function () {
        assert.deepEqual(decode('__foobar'), ['_foobar']);
      });

      it('... at the end', function () {
        assert.deepEqual(decode('foobar__'), ['foobar_']);
      });

      it('... in the middle', function () {
        assert.deepEqual(decode('foo__bar'), ['foo_bar']);
      })

    });

    it('should combine replacements', function () {
        assert.deepEqual(decode('__foo_bar--'), ['_foo bar-']);
    });

    it('should make multiple replacements', function () {
        assert.deepEqual(decode('__foo__bar__'), ['_foo_bar_']);
    });

  });

  describe('#handleRequest', function () {

    let req, res, next, badge, handler;
    beforeEach(function () {
      req = { url: '/foo-bar-baz.svg' };
      res = {
        end: sinon.stub(),
        send: sinon.stub(),
        setHeader: sinon.stub()
      };
      next = sinon.stub();
      badge = { render: sinon.stub() };
      handler = handleRequest(badge);
    });

    it('should handle `.svg` request', function () {
      req.url = '/foo-bar-baz.svg';
      handler(req, res, next);

      assert.notCalled(next);
      assert.called(res.send);
    });

    it('should skip not `.svg` request', function () {
      req.url = '/foo-bar-baz';
      handler(req, res, next);

      assert.called(next);
      assert.notCalled(res.send);
    });

    it('should set right header', function () {
      req.url = '/foo-bar-baz.svg';
      handler(req, res, next);

      assert.calledWith(res.setHeader, 'content-type', 'image/svg+xml;charset=utf-8');
    });

    it('should decode url', function () {
      req.url = '/foo%20-bar%23-baz%40.svg';
      handler(req, res, next);

      assert.calledWith(badge.render, 'foo ', 'bar#', 'baz@');
    });

    it('should ignore `/` char', function () {
      req.url = '/f/o/o-b/a/r-b/a/z.svg';
      handler(req, res, next);

      assert.calledWith(badge.render, 'f/o/o', 'b/a/r', 'b/a/z');
    });

    it('should split url into chunks and run render with it', function () {
      req.url = '/foo-bar-baz.svg';
      handler(req, res, next);

      assert.calledWith(badge.render, 'foo', 'bar', 'baz');
    });

  });

});
