'use strict';

const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');

const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');


let doLint = (paths, exit) => {
    return gulp.src(paths)
        .pipe(eslint({
            // http://eslint.org/docs/user-guide/configuring#using-configuration-files
        }))
        .pipe(eslint.format())
        .pipe(exit ? eslint.failAfterError() : eslint.result(() => {}));
};

let doWatchify = () => {

    let browserifyConfig = {
        entries: ['src/main.js'],
        external: [],
        transform: [babelify],
        // plugin: ['browserify-shim'],
        debug: true
    };

    let opts = Object.assign({}, watchify.args, browserifyConfig);

    let b = watchify(browserify(opts));

    b.on('update', doBundle.bind(global, b));
    b.on('log', console.log.bind(console));

    return b;
};

let doBundle = (b) => {
    return b.bundle()
        .on('error', console.error.bind(console))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build'));
};


gulp.task('default', function () {
    console.log('gulp default');
});

gulp.task('watch', () => {
    let gulpWatcher = gulp.watch(['gulpfile.js', 'src/**/*.js']);

    gulpWatcher.on('change', (e) => {
        if (e.type === 'changed' || e.type === 'added') {
            // return doLint(e.path, false);
        }
    });

    return doBundle(doWatchify());
});

gulp.task('lint', function () {
    return doLint(['gulpfile.js', 'src/**/*.js'], true);
});
