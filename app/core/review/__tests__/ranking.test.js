describe('app/core/review/ranking', function () {
    var ranking = require('../ranking');

    describe('#init', function () {
        it('should throw an error if there is no processors in options', function () {
            assert.throw(function () {
                ranking.init({});
            });
        });

        it('should init processors if passed through options', function () {
            var processors = [1, 2, 3];
            ranking.init({ processors: processors });

            assert.equal(ranking.rankingProcessorsList, processors);
        });
    });

    describe('#get', function () {
        it('should return processors list', function () {
            var processors = [1, 2, 3];
            ranking.init({ processors: processors });

            assert.equal(ranking.get(), processors);
        });
    });
});
