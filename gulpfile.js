var gulp = require('gulp');
var less = require('gulp-less');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var del = require('del');
var proxyMiddleware = require('http-proxy-middleware');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');

var paths = {
    styles: {
        src: 'src/styles/**/*.less',
        dest: 'dist/styles/'
    },
    scripts: {
        src: ['src/scripts/orderSetting.ts'],
        dest: 'dist/scripts/'
    },
    libs: {
        src: 'src/libs/*.*',
        dest: 'dist/libs/'
    },
    images: {
        src: 'src/images/*.*',
        dest: 'dist/images/'
    },
    pages: {
        src: 'src/**/*.html',
        dest: 'dist/'
    }
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
    // You can use multiple globbing patterns as you would with `gulp.src`,
    // for example if you are using del 2.0 or above, return its promise
    return del(['dist']);
}

/*
 * Define our tasks using plain functions
 */
function styles() {
    return gulp.src(paths.styles.src)
        .pipe(less())
        .pipe(cleanCSS())
        // pass in options to the stream
        /* .pipe(rename({
            basename: 'main',
            suffix: '.min'
        })) */
        .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    const tsProject = ts.createProject('tsconfig.json');
    return gulp.src(paths.scripts.src)
        .pipe(tsProject())
        .js
        .pipe(gulp.dest(paths.scripts.dest));
}

/* function watch() {
    gulp.watch(paths.scripts.src, gulp.series(scripts, browserSync.reload))
    gulp.watch(paths.styles.src, gulp.series(styles, browserSync.reload))
    gulp.watch(paths.pages.src, gulp.series(copyPages, browserSync.reload))
} */
function watch() {
    gulp.watch(paths.scripts.src, scripts).on('change', browserSync.reload)
    gulp.watch(paths.styles.src, styles).on('change', browserSync.reload)
    gulp.watch(paths.pages.src, copyPages).on('change', browserSync.reload)
}


function copyLibs() {
    return gulp.src(paths.libs.src).pipe(gulp.dest(paths.libs.dest))
}

function copyImages() {
    return gulp.src(paths.images.src).pipe(gulp.dest(paths.images.dest))
}

function copyPages() {
    return gulp.src(paths.pages.src).pipe(useref())
        /* .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss())) */
        .pipe(gulp.dest(paths.pages.dest));
}

function browser_server() {

    // 多个地址的反向代理
    // 反向代理网易图片在自己的页面上
    var proxy163 = proxyMiddleware('/f2e', {
        target: 'http://img1.cache.netease.com',
        headers: {
            host: 'img1.cache.netease.com' // 这个挺关键
        }
    });

    // 反向代理百度图片在自己的页面上
    var proxyAdtime = proxyMiddleware('/img', {
        target: 'http://www.baidu.com',
        headers: {
            host: 'www.baidu.com'
        }
    });
    browserSync({
        server: {
            baseDir: "./dist/",
            port: 8081,
            middleware: [proxy163, proxyAdtime]
        },
        startPath: '/pages/orderSetting.html'
    });
}

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.copyLibs = copyLibs;
exports.copyPages = copyPages;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(clean, gulp.parallel(styles, scripts, copyLibs, copyImages, copyPages));

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('build', build);

gulp.task('dev', gulp.series(build, gulp.parallel(browser_server, watch)));

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);