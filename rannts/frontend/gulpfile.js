var DESTINATION = "../assets/static",
    gulp = require("gulp"),
    rename = require("gulp-rename"),
    uglifyjs = require("gulp-uglify"),
    sass = require("gulp-sass"),
    autoprefixer = require("autoprefixer"),
    postcss = require("gulp-postcss"),
    cssnano = require("cssnano");


gulp.task("default", ["bundle_js", "bundle_css"]);

gulp.task("watch", ["default"], function() {
    gulp.watch("js/*", ["bundle_js"]);
    gulp.watch("styles/*", ["bundle_css"]);
});


gulp.task("bundle_js", function() {
    var options = {
        "mangle": true
    };

    return gulp.src("js/*.js")
        .pipe(uglifyjs(options))
        .pipe(rename("main.js"))
        .pipe(gulp.dest(DESTINATION + "/js"));
});


gulp.task("bundle_css", function(callback) {
    var processors = [
        autoprefixer({browsers: ['last 1 version']}),
        cssnano()
    ];

    return gulp.src("styles/main.sass")
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss(processors))
        .pipe(rename("main.css"))
        .pipe(gulp.dest(DESTINATION + "/css"));
});
