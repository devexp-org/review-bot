var sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyCSS = require('gulp-minify-css');

module.exports = function (gulp, paths, autoprefixerBrowsers) {
    gulp.task('sass:dev', function () {
        return gulp.src(paths.mainStyle)
            .pipe(sourcemaps.init())
            .pipe(sass({
                errLogToConsole: true,
                sourceComments: 'map'
            }))
            .on('error', console.error.bind(console))
            .pipe(autoprefixer(autoprefixerBrowsers))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(paths.dest.styles));
    });

    gulp.task('sass:prod', function () {
        return gulp.src(paths.mainStyle)
            .pipe(sass({
                errLogToConsole: true
            }))
            .on('error', console.error.bind(console))
            .pipe(autoprefixer(autoprefixerBrowsers))
            .pipe(minifyCSS())
            .pipe(gulp.dest(paths.dest.styles));
    });
};
