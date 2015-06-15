var babelify = require('babelify'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    empty = require('gulp-empty');

function generateScriptsTask(gulp, options) {
    var browserifyOptions = {
        insertGlobals: options.insertGlobals || true,
        entries: options.src,
        extensions: options.extensions || ['.js', '.jsx'],
        transform: ['babelify']
    };

    if (options.debug) {
        browserifyOptions.debug = true;
    }

    return function scriptsGeneratedTask() {
        return browserify(browserifyOptions)
            .transform(babelify.configure({
                loose: ['es6.classes', 'es6.modules', 'es6.properties.computed', 'es6.templateLiterals']
            }))
            .bundle()
            .on('error', console.error.bind(console, options))
            .pipe(options.debug ? empty() : uglify())
            .pipe(source(options.resultName))
            .pipe(gulp.dest(options.dest));
    };
}

module.exports = function (gulp, paths) {
    gulp.task('scripts:dev', generateScriptsTask(gulp, {
        src: [paths.clientEntryPoint],
        dest: paths.dest,
        resultName: 'app.js',
        debug: true
    }));

    gulp.task('scripts:prod', generateScriptsTask(gulp, {
        src: [paths.clientEntryPoint],
        dest: paths.dest,
        resultName: 'app.js'
    }));
};
