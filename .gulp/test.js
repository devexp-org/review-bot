var mocha = require('gulp-mocha');

module.exports = function (gulp, paths, options) {
    gulp.task('test', function () {
        return gulp.src(paths.tests, { read: false })
            .pipe(mocha(options));
    });

    gulp.task('test:watch', function () {
        gulp.watch(paths.scripts.concat(paths.tests), ['test']);
    });
};
