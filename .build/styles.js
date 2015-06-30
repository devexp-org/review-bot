var sass = require('gulp-sass'),
    empty = require('gulp-empty'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyCSS = require('gulp-minify-css');

function generateStylesTask(gulp, options) {
    return function stylesGeneratedTask() {
        return gulp
            .src(options.src)
            .pipe(options.debug ? sourcemaps.init() : empty())
            .pipe(sass({
                errLogToConsole: options.debug ? true : false
            }))
            .on('error', console.error.bind(console))
            .pipe(autoprefixer(options.autoprefixer))
            .pipe(options.debug ? sourcemaps.write() : empty())
            .pipe(options.debug ? empty() : minifyCSS())
            .pipe(gulp.dest(options.dest));
    };
}

module.exports = function (gulp, paths, autoprefixerBrowsers) {
    gulp.task('styles:dev', generateStylesTask(gulp, {
        src: paths.mainStyle,
        dest: paths.dest,
        autoprefixer: autoprefixerBrowsers,
        debug: true
    }));

    gulp.task('styles:prod', generateStylesTask(gulp, {
        src: paths.mainStyle,
        dest: paths.dest,
        autoprefixer: autoprefixerBrowsers
    }));
};
