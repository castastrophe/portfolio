'use strict';
 
const { src, dest, watch, task, series, parallel } = require('gulp');
const del = require('del');
// const path = require('path');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const flatten = require('gulp-flatten');
const browserSync = require('browser-sync').create();


sass.compiler = require('node-sass');

let assets = {
    wc_js: '*.umd?(.min).js?(.map)',
    wc_css: '*?(--noscript)?(.min).css?(.map)'
};

let source = {
    wc: './node_modules/@patternfly/**/',
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
    return src(assets.wc_js, {
        cwd: source.wc
    })
    .pipe(flatten())
    .pipe(dest(destination.vendor_js));
}

function copyAssetsCSS() {
    return src(assets.wc_css, {
        cwd: source.wc
    })
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