# -*- coding: utf-8 -*-


import chakert
import jinja2
import six

from lektor.pluginsystem import Plugin


@jinja2.evalcontextfilter
def typography(ctx, value, lang="ru"):
    value = six.text_type(value)
    html = chakert.Typograph.typograph_html(value, lang=lang)

    if ctx.autoescape:
        html = jinja2.Markup(html)

    return html


class TypograhyPlugin(Plugin):
    name = "lektor-typography"
    description = "Adds typography based on chakert"

    def on_setup_env(self, **extra):
        self.env.jinja_env.filters["typography"] = typography
