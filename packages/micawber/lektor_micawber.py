# -*- coding: utf-8 -*-


import posixpath
import urlparse

import jinja2
import micawber
import micawber.contrib.mcflask

from lektor.pluginsystem import Plugin


@jinja2.evalcontextfilter
def youtube_code(ctx, value):
    parsed = urlparse.urlsplit(value)
    if "youtube.com" in parsed.netloc:
        query = urlparse.parse_qs(parsed.query)
        vcode = query["v"][-1]
        value = "{scheme}://{netloc}".format(
            scheme=parsed.scheme,
            netloc=posixpath.join(parsed.netloc, "v", vcode)
        )

    if ctx.autoescape:
        value = jinja2.Markup(value)

    return value


class MicawberPlugin(Plugin):
    name = u"lektor-micawber"
    description = u"Adds micawber filters to the Lektor"

    def on_setup_env(self, **extra):
        providers = micawber.bootstrap_basic()
        micawber.contrib.mcflask.add_oembed_filters(self.env, providers)
        self.env.jinja_env.filters["youtube_code"] = youtube_code
