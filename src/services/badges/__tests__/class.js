import BadgeBase from '../class';

describe('services/badges/class', function () {

  let badgeBase;

  beforeEach(function () {
    badgeBase = new BadgeBase('https://shields.io/badges/');
  });

  describe('#create', function () {

    it('should throw an error if there is no subject', function () {
      assert.throws(() => badgeBase.create());
    });

    it('should throw an error if there is no status', function () {
      assert.throws(() => badgeBase.create('subject'));
    });

    it('should encode subject, status and color', function () {
      assert.include(
        badgeBase.create('"status"', '<subject>', '&color'),
        'https://shields.io/badges/%22status%22-%3Csubject%3E-%26color.svg'
      );
    });

    it('should build <img> tag with correct url', function () {
      assert.include(
        badgeBase.create('status', 'subject', 'color'),
        'https://shields.io/badges/status-subject-color.svg'
      );
    });

    it('should wrap badge in <a> tag if url is passed', function () {
      assert.include(
        badgeBase.create('status', 'subject', 'color', 'https://example.com'),
        '<a '
      );
    });

  });

  describe('#_escape', function () {

    it('should replace - to --', function () {
      assert.equal(badgeBase._escape('sta-tus'), 'sta--tus');
    });

    it('should replace space to _', function () {
      assert.equal(badgeBase._escape('sta tus'), 'sta_tus');
    });

    it('should replace _ to __', function () {
      assert.equal(badgeBase._escape('sta_tus'), 'sta__tus');
    });

    it('should handles numbers', function () {
      assert.equal(badgeBase._escape(1), '1');
    });
  });

});
