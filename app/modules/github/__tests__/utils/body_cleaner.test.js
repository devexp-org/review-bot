describe('modules/github/utils/body_cleaner', function () {
    var proxyquire = require('proxyquire');
    var _ = require('lodash');
    var bodyCleaner;

    beforeEach(function () {
        bodyCleaner = proxyquire('../../utils/body_cleaner', {
            'app/modules/config': {
                load: _.constant({
                    content: {
                        regex: /<start>([\s\S]*)<end>/g
                    }
                })
            }
        });
    });

    it('should clean body from generated content', function () {
        var result = bodyCleaner('<start>conetent<end>');

        assert.notInclude(result, '<start>');
        assert.notInclude(result, '<end>');
    });

    it('should keep other content', function () {
        var result = bodyCleaner('before<start>conetent<end>after');

        assert.include(result, 'before');
        assert.include(result, 'after');
    });
});
