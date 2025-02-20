const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber'); // エラーを確認
const notify = require('gulp-notify'); // エラーを通知する
const postcss = require('gulp-postcss'); // CSS
const mqpacker = require('css-mqpacker'); // メディアクエリ
const autoprefixer = require('autoprefixer'); // beforeprefix用
const sourcemaps = require('gulp-sourcemaps'); // ソースマップを作成する
const sassGlob = require('gulp-sass-glob'); // @importをまとめる
const rename = require('gulp-rename'); // ファイルをリネームする
const cleanCSS = require('gulp-clean-css'); // cssを圧縮する

// 画像を圧縮する
const imagemin = require('gulp-imagemin'); // 画像圧縮
const imageminMozjpeg = require('imagemin-mozjpeg'); // JPEG
const imageminPngquant = require('imagemin-pngquant'); // PNG
const imageminSvgo = require('imagemin-svgo'); // SVG
const webp = require('gulp-webp'); // webp化

// JSをコンパイルする
const babel = require('gulp-babel'); // ES6をES5に変換
const concat = require('gulp-concat'); // 一つにまとめる
const uglify = require('gulp-uglify'); // JSを圧縮

// EJS

const srcPath = {
  css: './scss/*.scss',
  img: './img_bk/**',
  js: './js_bk/*.js',
};

const destPath = {
  css: './css',
  img: './img',
  js: './js',
};

const cssSass = (done) => {
  return (
    src(srcPath.css)
      .pipe(
        plumber({
          errorHandler: notify.onError('Error:<%= error.message %>'),
        })
      )
      .pipe(sourcemaps.init())
      .pipe(sassGlob())
      .pipe(
        sass({
          outputStyle: 'expanded',
        })
      )
      // .pipe(sourcemaps.write("./"))
      .pipe(postcss([autoprefixer({ overrideBrowserslist: ['last 2 versions'] }), mqpacker()]))
      .pipe(dest(destPath.css)) // 圧縮前のCSSファイルの出力
      .pipe(cleanCSS()) // CSSを圧縮
      .pipe(
        rename({
          extname: '.min.css', //.min.cssの拡張子にする
        })
      )
      .pipe(dest(destPath.css))
      .on('end', done)
  ); // タスクの終了を通知
};

const imgMin = () => {
  return src(srcPath.img)
    .pipe(
      imagemin(
        [
          imageminMozjpeg({
            quality: 80,
          }),
          imageminPngquant(),
          imageminSvgo({
            plugins: [
              {
                removeViewbox: false,
              },
            ],
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(
      webp({
        // オプションを追加
        quality: 100,
      })
    )
    .pipe(dest(destPath.img));
};

const taskBabel = (done) => {
  src(srcPath.js)
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest(destPath.js));
  done();
};

// Browsersyncを起動し、すべてのファイルに変更があればリロードする
const watchBrowser = (done) => {
  browserSync.init({
    server: {
      baseDir: '../',
    },
    port: 3001,
  });

  gulp.watch('../**/*').on('change', browserSync.reload); // すべてのファイルに変更があればリロード
  done();
};

const watchFiles = (done) => {
  watch(srcPath.css, cssSass);
  watch(srcPath.img, imgMin);
  watch(srcPath.js, taskBabel);
  done();
};

exports.dev = parallel(watchFiles, watchBrowser);
exports.default = series(cssSass, imgMin);
