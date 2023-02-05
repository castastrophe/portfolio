'use strict';

const path = require ('path');

const gulp = require ('gulp');
const del = require ('del');

const rename = require ('gulp-rename');
const concat = require ('gulp-concat');
const babel = require ('gulp-babel');
const uglify = require ('gulp-uglify');
const sass = require ('gulp-sass')(require ('node-sass'));
// const print = require ('gulp-print');
const order = require ('gulp-order');
const postcss = require ('gulp-postcss');
const sourcemaps = require ('gulp-sourcemaps');
const flatten = require ('gulp-flatten');
const browserSync = require ('browser-sync');

browserSync.create();

let assets = {
    libs_js: 'jquery?(.magnific-popup).min.js',
    libs_css: 'magnific-popup.css'
};

let source = {
    libs: 'magnific-popup/**/',
    wc: '@patternfly/**/dist/',
    wc_polyfill: '@webcomponents/webcomponentsjs/webcomponents-loader.js',
    sass: './sass/**/',
    demo: './demo',
    img: './img',
    pages: './pages',
    js: './js'
};

let destination = {
    publish: './public',
    demo: './examples',
    css: 'css',
    img: 'img',
    js: 'js'
}

/* Compilation and clean-up */
const clean = () => del([
    destination.publish
]);

function compileSass() {
    return gulp.src([
            '*.scss',
            '!_*.scss',
        ], {
            cwd: source.sass
        })
        // .pipe(print(filepath => ` > compiling ${filepath}`))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            require('autoprefixer')(['> 0.5%', 'last 2 versions', 'not dead'])
        ]))
        .pipe(gulp.dest(path.join(destination.publish, destination.css)))
        .pipe(sass.sync({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(destination.publish, destination.css)))
        .pipe(browserSync.stream());
}

function compileJS() {
    return gulp.src([
            path.join(source.js, '*.js')
        ], {
            follow: true
        })
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
          }))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join(destination.publish, destination.js)))
        .pipe(browserSync.stream());
}

function copyAssetsPages() {
    return gulp.src([
            path.join(source.pages, '*.html')
        ], {
            follow: true
        })
        .pipe(flatten())
        .pipe(gulp.dest(destination.publish))
        .pipe(browserSync.stream());
}

function copyAssetsImages() {
    return gulp.src([
            path.join(source.img, '*.{jpg,png,svg,ico}')
        ], {
            follow: true
        })
        .pipe(flatten())
        .pipe(gulp.dest(path.join(destination.publish, destination.img)))
        .pipe(browserSync.stream());
}

function copyAssetsDemo() {
    return gulp.src([
            path.join(source.demo, '*')
        ], {
            follow: true
        })
        .pipe(gulp.dest(path.join(destination.publish, destination.demo)))
        .pipe(browserSync.stream());
}

function copyWCJS() {
    return gulp.src([
            source.wc_polyfill,
            path.join(source.wc, '*.min.js*')
        ], {
            cwd: './node_modules/',
            follow: true
        })
        // .pipe(print(filepath => ` > ${filepath}`))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join(destination.publish, destination.js)))
        .pipe(browserSync.stream());
}

function copyVendorJS() {
    return gulp.src([
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
        // .pipe(print(filepath => ` > ${filepath}`))
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join(destination.publish, destination.js)))
        .pipe(browserSync.stream());
}

function copyAssetsCSS() {
    return gulp.src([
            path.join(source.wc, '*.min.css'),
            path.join(source.libs, assets.libs_css),
            `!$ {path.join(source.wc, '*--noscript.min.css')}`
        ], {
            cwd: './node_modules'
        })
        // .pipe(print(filepath => ` > ${filepath}`))
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest(path.join(destination.publish, destination.css)))
        .pipe(browserSync.stream());
}

function copyNoscriptCSS() {
    return gulp.src([
            path.join(source.wc, '*--noscript.min.css')
        ], {
            cwd: './node_modules'
        })
        // .pipe(print(filepath => ` > ${filepath}`))
        .pipe(concat('noscript.min.css'))
        .pipe(gulp.dest(path.join(destination.publish, destination.css)))
        .pipe(browserSync.stream());
}

/* Server + watch events */
function server() {
    return browserSync.init({
        server: destination.publish
    });
}

const copy = gulp.parallel(
    gulp.parallel(copyWCJS, copyVendorJS),
    gulp.parallel(copyAssetsCSS, copyNoscriptCSS),
    copyAssetsImages,
    copyAssetsPages,
    copyAssetsDemo
);

const compile = gulp.series(
    clean,
    gulp.parallel(compileSass, compileJS)
);

const build = gulp.series(
    clean,
    gulp.parallel(copy, compile)
);

const watcher = () => gulp.parallel(
    gulp.watch(path.join(source.sass, '*'), compileSass),
    gulp.watch([
        path.join(source.demo, '*'),
        path.join(source.img, '*'),
        path.join(source.pages, '*')
    ], copy),
    gulp.watch(path.join(source.js, '*'), compileJS),
);

exports.clean = clean;
exports.compile = compile;
exports.copy = copy;
exports.build = build;
exports.server = server;
exports.default = gulp.series(clean, gulp.parallel(copy, compile));
exports.watcher = watcher;
exports.serve = gulp.series(build, gulp.parallel(server, watcher));
