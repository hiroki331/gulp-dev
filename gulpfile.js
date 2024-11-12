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
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const webp = require('gulp-webp');

const srcPath = {
  css: './scss/*.scss',
  img: './img_bk/**',
};

const destPath = {
  css: './css',
  img: './img',
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

const watchFiles = () => {
  watch(srcPath.css, cssSass);
};

const watchImgFiles = () => {
  watch(srcPath.img, imgMin);
};

exports.dev = watchFiles;

exports.img = watchImgFiles;

exports.default = series(cssSass);
