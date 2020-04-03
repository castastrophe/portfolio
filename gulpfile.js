'use strict';
 
const { src, dest, watch, task, series, parallel } = require('gulp');
const del         = require('del');
const path        = require('path');
const rename      = require('gulp-rename');
const sass        = require('gulp-sass');
const postcss     = require('gulp-postcss')
const sourcemaps  = require('gulp-sourcemaps');
const flatten     = require('gulp-flatten');
const browserSync = require('browser-sync').create();


sass.compiler = require('node-sass');

let assets = {
    libs_js: 'jquery?(.magnific-popup).min.js',
    libs_css: 'magnific-popup.css',
    wc_js: '*.umd.min.js?(.map)',
    wc_css: '*?(--noscript).min.css?(.map)',
    wc_polyfill: '*.js?(.map)'
};

let source = {
    libs: './node_modules/magnific-popup/**/',
    wc: './node_modules/@patternfly/**/dist/',
    wc_polyfill: './node_modules/@webcomponents/webcomponentsjs/',
    sass: './sass/**/'
};

let destination = {
    css: './css',
    vendor_js: './js/vendor',
    vendor_css: './css/vendor'
}
 
/* Compilation and clean-up */
function compileSass() {
    return src('*.scss', {
        cwd: source.sass
    })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ require('autoprefixer')({
        grid: 'autoplace'
    })]))
    .pipe(dest(destination.css))
    .pipe(sass.sync({
        outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(destination.css))
    .pipe(browserSync.stream());
}

function cleanCSS() {
    return del([
        destination.css
    ]);
}

task('clean:css', cleanCSS);
task('compile:sass', compileSass);
task('compile', series('clean:css', 'compile:sass'));

function cleanAssets() {
    return del([
        destination.vendor_js,
        destination.vendor_css
    ]);
}
 
function copyAssetsJS() {
    return src([
        path.join(source.wc, assets.wc_js),
        path.join(source.wc_polyfill, assets.wc_polyfill),
        path.join(source.libs, assets.libs_js)
    ], {
        follow: true
    })
    .pipe(flatten())
    .pipe(dest(destination.vendor_js));
}

function copyAssetsCSS() {
    return src([
        path.join(source.wc, assets.wc_css),
        path.join(source.libs, assets.libs_css)
    ])
    .pipe(flatten())
    .pipe(dest(destination.vendor_css));
}

task('clean:assets', cleanAssets);
task('clean:css', cleanCSS);
task('clean', parallel('clean:css', 'clean:assets'));

task('copy:assets:js', copyAssetsJS);
task('copy:assets:css', copyAssetsCSS);
task('copy:assets', parallel('copy:assets:js', 'copy:assets:css'));

task('copy', series('clean:assets', 'copy:assets'));

task('default', parallel('compile', 'copy'));


/* Server + watch events */
function watcher(cb) {
    watch(['*.scss'], {
        cwd: source.sass
    }, compileSass);

    browserSync.reload();
}

function server(cb) {
    browserSync.init({
        server: {
            '/': './',
            '/examples': './examples',
            '/css': './css',
            '/js': './js',
            '/fonts': './fonts',
            '/img': './img',
            '/favicon.ico': './favicon.ico'
        }
    });
}

task('server', server);
task('watcher', watcher);

task('serve', series('default', parallel('watcher', 'server')));