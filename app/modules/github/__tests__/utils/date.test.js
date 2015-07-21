describe('modules/github/utils/date', function () {
    describe('#getSinceDate', function () {
        var getSinceDate = require('../../utils/date').getSinceDate;

        it('should return nothing if date is empty', function () {
            assert.notOk(getSinceDate());
        });

        it('should return formated date', function () {
            assert.ok(getSinceDate([1, 'day']));
        });
    });
});
