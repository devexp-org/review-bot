describe('Core Badges', function () {
    var badges = require('../');

    beforeEach(function () {
        badges.init({
            style: 'custom',
            url: 'http://my-url.tld'
        });
    });

    describe('#init', function () {
        it('should use options.url for img src', function () {
            assert.match(badges.create('subject', 'status', 'color'), 'http://my-url.tld');
        });

        it('should use options.style for badge style', function () {
            assert.match(badges.create('subject', 'status', 'color'), '?style=custom');
        });

        it('should set flat style as default', function () {
            badges.init({
                url: 'http://my-url.tld'
            });

            assert.equal(badges.style, 'flat');
        });
    });

    describe('#create', function () {
        it('should throw an error without badge subject', function () {
            assert.throw(function () {
                badges.create();
            }, Error);
        });

        it('should set default status to ...', function () {
            assert.match(badges.create('subject', '', 'color'), 'subject-...');
        });

        it('should set default color to lightgrey', function () {
            assert.match(badges.create('subject', 'status'), 'subject-status-lightgrey');
        });

        it('should create img if url is not passed', function () {
            assert.match(badges.create('subject', 'status', 'color'), '<img');
            assert.notInclude(badges.create('subject', 'status', 'color'), '<a');
        });

        it('should create link if url is passed', function () {
            assert.match(badges.create('subject', 'status', 'color', 'http://test.url'), '<a');
            assert.match(badges.create('subject', 'status', 'color', 'http://test.url'), 'http://test.url');
        });

        it('should replace - to -- in subject and status', function () {
            assert.match(badges.create('sub-ject', 'status', 'color'), 'sub--ject');
            assert.match(badges.create('subject', 'st-atus', 'color'), 'st--atus');
        });
    });
});
