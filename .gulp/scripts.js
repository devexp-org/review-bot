var browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream');

module.exports = function (gulp, paths) {
    gulp.task('scripts:dev', function () {
        return browserify({
                insertGlobals: true,
                entries: [paths.mainScript],
                transform: ['babelify'],
                extensions: ['.js', '.jsx'],
                debug: true
            })
            .bundle()
            .on('error', console.error.bind(console))
            .pipe(source('app.js'))
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
