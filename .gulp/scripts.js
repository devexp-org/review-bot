var browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

module.exports = function (gulp, paths) {
    gulp.task('scripts:dev', function () {
        return gulp.src(paths.mainScript)
            .pipe(browserify({
                insertGlobals: true,
                transform: ['babelify'],
                extensions: ['.js', '.jsx'],
                debug: true
            }))
            .on('error', console.error.bind(console))
            .pipe(rename('app.js'))
            .pipe(gulp.dest(paths.dest.scripts));
    });

    gulp.task('scripts:prod', function () {
        return gulp.src(paths.mainScript)
            .pipe(browserify({
                insertGlobals: true,
                transform: ['babelify'],
                extensions: ['.js', '.jsx'],
                debug: false
            }))
            .pipe(uglify())
            .on('error', console.error.bind(console))
            .pipe(rename('app.js'))
            .pipe(gulp.dest(paths.dest.scripts));
    });
};
