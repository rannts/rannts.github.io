# -*- coding: utf-8 -*-


import jinja2
import micawber
import micawber.contrib.mcflask

from lektor.pluginsystem import Plugin


class MicawberPlugin(Plugin):
    name = u"lektor-micawber"
    description = u"Adds micawber filters to the Lektor"

    def on_setup_env(self, **extra):
        providers = micawber.bootstrap_basic()
        micawber.contrib.mcflask.add_oembed_filters(self.env, providers)
