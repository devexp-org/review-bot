'use strict';

import _ from 'lodash';
import proxyquire from 'proxyquire';

describe('modules/badge-constructor', function () {

  let BadgeConstructor, existsStub, readFileStub, compileStub;

  beforeEach(function () {
    existsStub = sinon.stub().returns(true);
    compileStub = sinon.stub().returns(() => 'stub');
    readFileStub = sinon.stub().returns('template');

    BadgeConstructor = proxyquire('../../badge-constructor', {
      fs: {
        existsSync: existsStub,
        readFileSync: readFileStub
      },
      ejs: { compile: compileStub }
    });
  });

  it('should call `compile` only once', function () {
    const badge = new BadgeConstructor();

    badge.render('subject', 'status', 'fff');
    badge.render('subject1', 'status2', '000');
    const result = badge.render('subject2', 'status2', '999');

    assert.equal(result, 'stub');
    assert.calledOnce(compileStub);
  });

  it('should receive option `templateName`', function () {
    const badge = new BadgeConstructor({ templateName: 'fancy' });

    badge.render('subject', 'status', 'fff');

    assert.calledWith(readFileStub, 'fancy.ejs');
  });

  it('should receive option `templatePath`', function () {
    const badge = new BadgeConstructor({ templatePath: '/var/template' });

    badge.render('subject', 'status', 'fff');

    assert.calledWith(readFileStub, '/var/template/flat.ejs');
  });

  it('should throw an error if template not found', function () {
    existsStub.returns(false);

    const badge = new BadgeConstructor();

    assert.throws(
      badge.render.bind(badge, 'subject', 'status', 'fff'),
      /not found/
    );
  });

  describe('#mapColor', function () {

    let badge;
    beforeEach(function () {
      badge = new BadgeConstructor();
    });

    it('should accept color as keyword', function () {
      const c1 = badge.mapColor('brightgreen');
      const c2 = badge.mapColor('green');
      const c3 = badge.mapColor('yellowgreen');
      const c4 = badge.mapColor('yellow');
      const c5 = badge.mapColor('orange');
      const c6 = badge.mapColor('red');
      const c7 = badge.mapColor('lightgrey');
      const c8 = badge.mapColor('blue');

      const colors = [c1, c2, c3, c4, c5, c6, c7, c8];
      assert(_.uniq(colors).length === 8);
    });

    it('should return default value if map fails', function () {
      const c1 = badge.mapColor('sun');
      const c2 = badge.mapColor('moon');
      const c3 = badge.mapColor('mars');
      const c4 = badge.mapColor('earth');

      const colors = [c1, c2, c3, c4];
      assert(_.uniq(colors).length === 1);
    });

    it('should accept color in hex codes', function () {
      const c1 = badge.mapColor('fff');
      assert.equal(c1, '#fff');

      const c2 = badge.mapColor('e0e0e0');
      assert.equal(c2, '#e0e0e0');
    });

    it('should return default color if a hex value is invalid', function () {
      const c1 = badge.mapColor('00ffgg');
      assert.notEqual(c1, '#00ffgg');
    });

  });

});
