'use strict';

const {
    src,
    dest,
    watch,
    task,
    series,
    parallel
} = require('gulp');
const del = require('del');
const path = require('path');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const print = require('gulp-print').default;
const order = require('gulp-order');
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps');
const flatten = require('gulp-flatten');
const browserSync = require('browser-sync').create();

sass.compiler = require('node-sass');

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

task('clean', clean);

function compileSass() {
    return src([
            '*.scss',
            '!_*.scss',
        ], {
            cwd: source.sass
        })
        .pipe(print(filepath => ` > compiling ${filepath}`))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([require('autoprefixer')({
            grid: 'autoplace'
        })]))
        .pipe(dest(path.join(destination.publish, destination.css)))
        .pipe(sass.sync({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(path.join(destination.publish, destination.css)))
        .pipe(browserSync.stream());
}

function compileJS() {
    return src([
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
        .pipe(dest(path.join(destination.publish, destination.js)))
        .pipe(browserSync.stream());
}

task('compile:sass', compileSass);
task('compile:js', compileJS);
task('compile', series('clean', parallel('compile:sass', 'compile:js')));

function copyAssetsPages() {
    return src([
            path.join(source.pages, '*.html')
        ], {
            follow: true
        })
        .pipe(flatten())
        .pipe(dest(destination.publish))
        .pipe(browserSync.stream());
}

function copyAssetsImages() {
    return src([
            path.join(source.img, '*.{jpg,png,svg,ico}')
        ], {
            follow: true
        })
        .pipe(flatten())
        .pipe(dest(path.join(destination.publish, destination.img)))
        .pipe(browserSync.stream());
}

function copyAssetsDemo() {
    return src([
            path.join(source.demo, '*')
        ], {
            follow: true
        })
        .pipe(dest(path.join(destination.publish, destination.demo)))
        .pipe(browserSync.stream());
}

function copyWCJS() {
    return src([
            source.wc_polyfill,
            path.join(source.wc, '*.min.js*')
        ], {
            cwd: './node_modules/',
            follow: true
        })
        .pipe(print(filepath => ` > ${filepath}`))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(dest(path.join(destination.publish, destination.js)))
        .pipe(browserSync.stream());
}

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
        .pipe(dest(path.join(destination.publish, destination.js)))
        .pipe(browserSync.stream());
}

function copyAssetsCSS() {
    return src([
            path.join(source.wc, '*.min.css'),
            path.join(source.libs, assets.libs_css),
            `!$ {path.join(source.wc, '*--noscript.min.css')}`
        ], {
            cwd: './node_modules'
        })
        // .pipe(print(filepath => ` > ${filepath}`))
        .pipe(concat('vendor.min.css'))
        .pipe(dest(path.join(destination.publish, destination.css)))
        .pipe(browserSync.stream());
}

function copyNoscriptCSS() {
    return src([
            path.join(source.wc, '*--noscript.min.css')
        ], {
            cwd: './node_modules'
        })
        .pipe(print(filepath => ` > ${filepath}`))
        .pipe(concat('noscript.min.css'))
        .pipe(dest(path.join(destination.publish, destination.css)))
        .pipe(browserSync.stream());
}

task('copy:assets:pages', copyAssetsPages);
task('copy:assets:images', copyAssetsImages);
task('copy:assets:demo', copyAssetsDemo);
task('copy:assets:js', parallel(copyWCJS, copyVendorJS));
task('copy:assets:css', parallel(copyAssetsCSS, copyNoscriptCSS));

task('copy', parallel('copy:assets:js', 'copy:assets:css', 'copy:assets:images', 'copy:assets:pages', 'copy:assets:demo'));

task('build', series('clean', parallel('copy', 'compile')));
task('default', series('clean', parallel('copy', 'compile')));

/* Server + watch events */
function server() {
    return browserSync.init({
        server: destination.publish
    });
}

task('server', server);

// function updateAsset() {
//     if (filepath.indexOf(source.pages)) {
//         return copyAssetsPages();
//     }

//     if (filepath.indexOf(source.img)) {
//         return copyAssetsImages();
//     }

//     if (filepath.indexOf(source.demo)) {
//         return copyAssetsDemo();
//     }
// }

task('watch:sass', () => {
    watch(path.join(source.sass, '*'), compileSass);
});
task('watch:js', () => {
    watch(path.join(source.js, '*'), compileJS);
});
task('watch:assets', () => {
    watch([
        path.join(source.demo, '*'),
        path.join(source.img, '*'),
        path.join(source.pages, '*')
    ], series('copy'));
});

task('watcher', parallel('watch:sass', 'watch:assets', 'watch:js'));

task('serve', series('build', parallel('server', 'watcher')));
