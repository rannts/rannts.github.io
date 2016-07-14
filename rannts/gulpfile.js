var DESTINATION = "assets/static",
    gulp = require("gulp"),
    rename = require("gulp-rename"),
    uglifyjs = require("gulp-uglify"),
    sass = require("gulp-sass"),
    autoprefixer = require("autoprefixer"),
    postcss = require("gulp-postcss"),
    cssnano = require("cssnano"),
    htmlmin = require("gulp-html-minifier"),
    optipng = require("gulp-optipng");


gulp.task("default", ["bundle_js", "bundle_css", "bundle_images"]);

gulp.task("watch", ["default"], function() {
    gulp.watch("frontend/js/*", ["bundle_js"]);
    gulp.watch("frontend/styles/*", ["bundle_css"]);
    gulp.watch("frontend/images/*", ["bundle_images"]);
});


gulp.task("bundle_js", function() {
    var options = {
        "mangle": true
    };

    return gulp.src("frontend/js/*.js")
        .pipe(uglifyjs(options))
        .pipe(rename("main.js"))
        .pipe(gulp.dest(DESTINATION + "/js"));
});


gulp.task("bundle_css", function() {
    var processors = [
        autoprefixer({browsers: ["last 1 version"]}),
        cssnano()
    ];

    return gulp.src("frontend/styles/main.sass")
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss(processors))
        .pipe(rename("main.css"))
        .pipe(gulp.dest(DESTINATION + "/css"));
});


gulp.task("bundle_images", function() {
    var options = ["-o2"];

    return gulp.src("frontend/images/*")
        .pipe(optipng(options))
        .pipe(gulp.dest(DESTINATION + "/images"));
})


gulp.task("bundle_html", function() {
  gulp.src('./qqq/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      decodeEntities: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeEmptyElements: false, // required for burger menu
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      sortAttributes: true,
      sortClassName: true,
      useShortDoctype: true
    }))
    .pipe(gulp.dest('./qqq'))
});
