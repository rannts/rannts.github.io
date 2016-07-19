# -*- coding: utf-8 -*-


import os

from lektor.pluginsystem import Plugin
from lektor.reporter import reporter
from lektor.utils import portable_popen


BUILD_FLAG = "gulp"
"""Build flag to use if we want to activate the plugin."""

GULP_TASK_SERVER_SPAWN = "server_spawn"
"""Gulp task which should be executed on server spawn."""

GULP_TASK_BEFORE_BUILD_ALL = "before_build_all"
"""Gulp task which should be executed before starting to build all."""

GULP_TASK_AFTER_BUILD_ALL = "after_build_all"
"""Gulp task which should be executed after build all is completed."""

DEFAULT_SOURCE = "frontend"
"""Default source directory (relative to the root)."""

DEFAULT_SOURCE_JS_DIR = "js"
"""Default name of the directory with JS files in DEFAULT_SOURCE."""

DEFAULT_SOURCE_CSS_DIR = "css"
"""Default name of the directory with CSS/SASS/LESS files in DEFAULT_SOURCE."""

DEFAULT_SOURCE_IMG_DIR = "images"
"""Default name of the directory with image files in DEFAULT_SOURCE."""


class GulpPlugin(Plugin):
    name = "Integration of Lektor and Gulp"
    description = "Simple plugin to integrate Gulp and Lektor"

    def __init__(self, *args, **kwargs):
        super(GulpPlugin, self).__init__(*args, **kwargs)

        self.gulp_process = None
        self.cfg = self.get_config()
        self.is_enabled = False

    @property
    def enabled(self):
        return self.is_enabled

    @enabled.setter
    def enabled(self, value):
        self.is_enabled = bool(value.get(BUILD_FLAG))

    @property
    def gulp_path(self):
        return os.path.join(self.env.root_path, "node_modules",
                            "gulp", "bin", "gulp.js")

    @property
    def source(self):
        return self.get_config().get("source", DEFAULT_SOURCE)

    @property
    def source_js_dir(self):
        return self.get_config().get("source_js_dir", DEFAULT_SOURCE_JS_DIR)

    @property
    def source_css_dir(self):
        return self.get_config().get("source_css_dir", DEFAULT_SOURCE_CSS_DIR)

    @property
    def source_img_dir(self):
        return self.get_config().get("source_img_dir", DEFAULT_SOURCE_IMG_DIR)

    @property
    def gulp_options(self):
        options = {
            "source": self.source,
            "source_js_dir": self.source_js_dir,
            "source_css_dir": self.source_css_dir,
            "source_img_dir": self.source_img_dir
        }

        for key, value in options.items():
            if not value:
                continue
            yield "--{0}".format(key)
            yield value

    def run_gulp(self, task, result_path=None):
        args = [self.gulp_path, task]
        args.extend(self.gulp_options)

        if result_path:
            args.extend(("--result_dir", result_path))

        return portable_popen(args, cwd=self.env.root_path)

    def on_server_spawn(self, build_flags, **extra):
        self.enabled = build_flags

        if self.enabled:
            reporter.report_generic("Spawning Gulp watcher")
            self.gulp_process = self.run_gulp(GULP_TASK_SERVER_SPAWN)

    def on_server_stop(self, **extra):
        if self.gulp_process is not None:
            reporter.report_generic("Stopping Gulp watcher")
            self.gulp_process.kill()
            self.gulp_process = None

    def on_before_build_all(self, builder, **extra):
        self.enabled = builder.build_flags

        if not self.enabled or self.gulp_process:
            return

        reporter.report_generic("Starting Gulp static build")
        self.run_gulp(GULP_TASK_BEFORE_BUILD_ALL).wait()
        reporter.report_generic("Finished Gulp static build")

    def on_after_build_all(self, builder, **extra):
        if not self.enabled or self.gulp_process:
            return

        reporter.report_generic("Starting Gulp post-build actions")
        self.run_gulp(
            GULP_TASK_AFTER_BUILD_ALL, builder.destination_path).wait()
        reporter.report_generic("Finished Gulp post-build actions")
