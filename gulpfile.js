'use strict';

const {
    src,
    dest,
    task,
    series,
    parallel
} = require('gulp');
const del = require('del');
const path = require('path');
const concat = require('gulp-concat');
const print = require('gulp-print').default;
const order = require('gulp-order');
const sourcemaps = require('gulp-sourcemaps');

let assets = {
    libs_js: 'jquery?(.magnific-popup).min.js',
    libs_css: 'magnific-popup.css'
};

let source = {
    libs: 'magnific-popup/**/',
    wc: '@patternfly/**/dist/',
    sass: './sass/**/',
    demo: './demo',
    img: './img',
    pages: './pages',
    js: './js'
};

let destination = {
    temp: './_temp',
    demo: './examples',
    css: 'css',
    img: 'img',
    js: 'js'
}

/* Compilation and clean-up */
const clean = () => del([
    destination.temp
]);

task('clean', clean);

function copyVendorJS() {
    return src([
            path.join(source.libs, assets.libs_js)
        ], {
            cwd: './node_modules/',
            follow: true
        })
        .pipe(order([
            'magnific-popup/website/third-party-libs/jquery.min.js',
            'magnific-popup/dist/jquery.magnific-popup.min.js'
        ], {
            base: './node_modules'
        }))
        .pipe(print(filepath => ` > ${filepath}`))
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.js'))
        .pipe(sourcemaps.write())
        .pipe(dest(path.join(destination.temp, destination.js)));
}

function copyAssetsCSS() {
    return src([
            path.join(source.wc, '*.min.css'),
            path.join(source.libs, assets.libs_css),
            `!${path.join(source.wc, '*--noscript.min.css')}`
        ], {
            cwd: './node_modules'
        })
        // .pipe(print(filepath => ` > ${filepath}`))
        .pipe(concat('vendor.min.css'))
        .pipe(dest(path.join(destination.temp, destination.css)));
}

function copyNoscriptCSS() {
    return src([
            path.join(source.wc, '*--noscript.min.css')
        ], {
            cwd: './node_modules'
        })
        .pipe(print(filepath => ` > ${filepath}`))
        .pipe(concat('noscript.min.css'))
        .pipe(dest(path.join(destination.temp, destination.css)));
}

task('concat:js', copyVendorJS);
task('concat:css', parallel(copyAssetsCSS, copyNoscriptCSS));

task('concat', parallel('concat:js', 'concat:css'));

task('build', series('clean', 'concat'));
task('default', series('clean', 'concat'));