var gulp = require('gulp'),

    AUTOPREFIXER_BROWSERS = [
        'last 2 versions'
    ],

    PATHS = {
        mainStyle: 'client/styles/style.scss',
        styles: ['client/styles/style.scss', 'client/styles/*.scss', 'client/styles/**/*.scss'],

        mainScript: 'client/index.jsx',
        scripts: [
            'client/actions/*.js',
            'client/components/*.jsx',
            'client/components/**/*.jsx',
            'client/constants/*.js',
            'client/mixins/*.js',
            'client/pages/*.jsx',
            'client/stores/*.js',
            'client/*.jsx',
            'client/routes.js'
        ],

        dest: {
            styles: './public',
            scripts: './public'
        }
    };

/**
 * Tasks
 */
require('./.gulp/serve')(gulp);
require('./.gulp/scripts')(gulp, PATHS);
require('./.gulp/sass')(gulp, PATHS, AUTOPREFIXER_BROWSERS);

/**
 * Watchers
 */
gulp.task('watch', function () {
    gulp.watch(PATHS.scripts, ['scripts:dev']);
    gulp.watch(PATHS.styles, ['sass:dev']);
});

/**
 * Main Tasks
 */
gulp.task('dev', ['scripts:dev', 'sass:dev', 'serve', 'watch']);
