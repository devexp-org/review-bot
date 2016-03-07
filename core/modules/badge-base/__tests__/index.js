import BadgeBase from '../';

describe('modules/badge-base', () => {
  const badgeBase = new BadgeBase('http://shields.io/badges/');

  describe('#create', () => {
    it('should throw an error if there is no subject', () => {
      assert.throws(() => badgeBase.create());
    });

    it('should throw an error if there is no status', () => {
      assert.throws(() => badgeBase.create('subject'));
    });

    it('should encode subject, status and color', () => {
      assert.include(
        badgeBase.create('"status"', '<subject>', '&color'),
        'http://shields.io/badges/%22status%22-%3Csubject%3E-%26color.svg'
      );
    });

    it('should build <img> tag with correct url', () => {
      assert.include(
        badgeBase.create('status', 'subject', 'color'),
        'http://shields.io/badges/status-subject-color.svg'
      );
    });

    it('should wrap badge in <a> tag if url is passed', () => {
      assert.include(
        badgeBase.create('status', 'subject', 'color', 'https://example.com'),
        '<a '
      );
    });
  });

  describe('#_escape', () => {
    it('should replace - to --', () => {
      assert.equal(badgeBase._escape('sta-tus'), 'sta--tus');
    });

    it('should replace space to _', () => {
      assert.equal(badgeBase._escape('sta tus'), 'sta_tus');
    });

    it('should replace _ to __', () => {
      assert.equal(badgeBase._escape('sta_tus'), 'sta__tus');
    });

    it('should handles numbers', () => {
      assert.equal(badgeBase._escape(1), '1');
    });
  });
});
