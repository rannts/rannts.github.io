// Gulpfile for rannts statics
// Also, tuned for lektor-gulp

// Modules import
var addsrc = require("gulp-add-src"),
    args = require("minimist")(process.argv.slice(2)),
    autoprefixer = require("autoprefixer"),
    concat = require("gulp-concat"),
    critical = require("critical").stream,
    cssnano = require("cssnano"),
    gulp = require("gulp"),
    htmlmin = require("gulp-html-minifier"),
    imagemin_gifsicle = require("imagemin-gifsicle"),
    imagemin_mozjpeg = require("imagemin-mozjpeg"),
    imagemin = require("gulp-imagemin"),
    imagemin_zopfli = require("imagemin-zopfli"),
    path = require("path"),
    postcss_fixes = require("postcss-fixes"),
    postcss = require("gulp-postcss"),
    purify = require("gulp-purifycss"),
    sass = require("gulp-sass"),
    typograph = require("gulp-typograf"),
    uglifyjs = require("gulp-uglify");


// Constants
var DEFAULT_SOURCE = "frontend",
    DEFAULT_ASSETS = path.join("assets", "static");


// Directories used for tasks
var SOURCE = args.source || DEFAULT_SOURCE,
    SOURCE_JS_DIR = args.source_js_dir || "js",
    SOURCE_CSS_DIR = args.source_css_dir || "css",
    SOURCE_IMG_DIR = args.source_img_dir || "images",
    RESULT_DIR = args.result_dir || "",
    SOURCE_JS = path.join(SOURCE, SOURCE_JS_DIR),
    SOURCE_CSS = path.join(SOURCE, SOURCE_CSS_DIR),
    SOURCE_IMG = path.join(SOURCE, SOURCE_IMG_DIR),
    ASSETS_JS = args.assets_js || path.join(DEFAULT_ASSETS, SOURCE_JS_DIR),
    ASSETS_CSS = args.assets_css || path.join(DEFAULT_ASSETS, SOURCE_CSS_DIR),
    ASSETS_IMG = args.assets_img || path.join(DEFAULT_ASSETS, SOURCE_IMG_DIR);


require("events").EventEmitter.prototype._maxListeners = 100;


gulp.task("default", ["build_static", "watch"]);
gulp.task("build_static", ["bundle_js", "bundle_css", "bundle_images"]);

// Tasks for lektor-gulp
gulp.task("server_spawn", ["build_static", "watch"]);
gulp.task("before_build_all", ["build_static"]);
gulp.task("after_build_all", ["compress_images", "process_html", "process_css", "critical_css"]);


gulp.task("watch", function() {
    gulp.watch(path.join(SOURCE_JS, '**.js'), ["bundle_js"]);
    gulp.watch(path.join(SOURCE_CSS, '**.sass'), ["bundle_css"]);
    gulp.watch(SOURCE_IMG, ["bundle_images"]);
});


gulp.task("bundle_js", function() {
    var options = {
        "mangle": true
    };

    return gulp.src(path.join(SOURCE_JS, "**.js"))
        .pipe(concat("main.js"))
        .pipe(uglifyjs(options))
        .pipe(gulp.dest(ASSETS_JS));
});


gulp.task("bundle_css", function() {
    var processors = [
        postcss_fixes(),
        autoprefixer({browsers: ["last 3 version"]}),
    ];

    return gulp.src(path.join(SOURCE_CSS, "main.sass"))
        .pipe(sass().on("error", sass.logError))
        .pipe(addsrc.append(
            path.join("node_modules", "typograf", "dist", "typograf.css")))
        .pipe(concat("main.css"))
        .pipe(postcss(processors))
        .pipe(gulp.dest(ASSETS_CSS));
});


gulp.task("bundle_images", function() {
    return gulp.src(path.join(SOURCE_IMG, "**"))
        .pipe(gulp.dest(ASSETS_IMG));
});


gulp.task("compress_images", function() {
    var gifPlugin = imagemin_gifsicle({"optimizationLevel": 3}),
        pngPlugin = imagemin_zopfli({"more": true}),
        jpegPlugin = imagemin_mozjpeg(),
        srcPaths = [
            path.join(RESULT_DIR, "**", "*.jpg"),
            path.join(RESULT_DIR, "**", "*.jpeg"),
            path.join(RESULT_DIR, "**", "*.png"),
            path.join(RESULT_DIR, "**", "*.gif")
        ];

    return gulp.src(srcPaths)
        .pipe(imagemin([gifPlugin, pngPlugin, jpegPlugin]))
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("process_html", function() {
    var typo_options = {
            "lang": "ru",
            "enable": [
                "common/space/delLeadingBlanks",
                "ru/money/ruble",
                "ru/optalign/*"
            ]
        },
        options = {
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: false,
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
        };

    return gulp.src(path.join(RESULT_DIR, "**/*.html"))
        .pipe(typograph(typo_options))
        .pipe(htmlmin(options))
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("process_css", function () {
    var source_css = path.join(RESULT_DIR, "**", "main.css"),
        context = [
            path.join(RESULT_DIR, "**", "*.js"),
            path.join(RESULT_DIR, "**", "*.html")
        ];

    return gulp.src(path.join(RESULT_DIR, "**/main.css"))
        .pipe(purify(context))
        .pipe(postcss([cssnano()]))
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("critical_css", ["process_css", "process_html"], function () {
    var path_htmls = path.join(RESULT_DIR, "**", "*.html"),
        critical_stream = critical({
            base: RESULT_DIR,
            inline: true,
            minify: true,
            css: [path.join(RESULT_DIR, "static", "css", "main.css")]
        });

    return gulp.src(path_htmls)
        .pipe(critical_stream)
        .on('error', function(err) { console.log(err.message); })
        .pipe(gulp.dest(RESULT_DIR));
});
