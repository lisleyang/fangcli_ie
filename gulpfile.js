const gulp = require('gulp');
const less = require('gulp-less');
const ts = require('gulp-typescript');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');   //minify CSS
const proxyMiddleware = require('http-proxy-middleware');
const browserSync = require('browser-sync');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');

let NODE_ENV = process.env.NODE_ENV;

var paths = {
  styles: {
    src: 'src/styles/**/*.less',
    dest: 'dist/styles/'
  },
  scripts: {
    src: 'src/scripts/**/*.ts',
    dest: 'dist/scripts/'
  },
  pages : {
    src : 'src/pages/**/*.html',
    dest : 'dist/pages/'
  }
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del([ 'dist' ]);
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    const tsProject = ts.createProject('tsconfig.json');
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        // .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest(paths.scripts.dest));
}

function copyLibs() {
    return gulp.src(paths.libs.src).pipe(gulp.dest(paths.libs.dest))
}

function copyImages() {
    return gulp.src(paths.images.src).pipe(gulp.dest(paths.images.dest))
}
function copyPages() {
    return gulp.src(paths.pages.src)
        /* .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss())) */
        .pipe(gulp.dest(paths.pages.dest));
}

function watch() {
  gulp.watch(paths.scripts.src, scripts).on('change', browserSync.reload);
  gulp.watch(paths.styles.src, styles).on('change', browserSync.reload);
  gulp.watch(paths.pages.src, copyPages).on('change', browserSync.reload);
}

function browser_server() {
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
            middleware: [proxyAdtime]
        },
        startPath: '/pages/demo.html'
    });
}

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(clean, gulp.parallel(styles, scripts,copyPages));
var dev = gulp.series(build, gulp.parallel(browser_server, watch));

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('build', build);
gulp.task('dev',dev)

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);