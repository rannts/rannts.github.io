# -*- coding: utf-8 -*-


import urlparse

import jinja2

from lektor.pluginsystem import Plugin


TEMPLATE = (
    '<script type="text/javascript" charset="utf-8"'
    'async src="https://api-maps.yandex.ru/services/constructor/1.0/js/?'
    'sid={constructor}&width=100%&height=500&lang=ru_RU&sourceType={source}'
    '&scroll=true"></script>'
).strip()


@jinja2.evalcontextfilter
def parse_yandexmaps(ctx, value):
    url = urlparse.urlparse(value.url)
    query = urlparse.parse_qs(url.query)
    code = TEMPLATE.format(
        constructor=query["um"][-1].split(":")[-1],
        source=query["source"][-1]
    )
    if ctx.autoescape:
        code = jinja2.Markup(code)
    print code

    return code


class YandexmapsPlugin(Plugin):
    name = u'lektor-yandexmaps'
    description = u'Parses a link on YandexMaps constructor and creates embed'

    def on_setup_env(self, **extra):
        self.env.jinja_env.filters["yandexmaps"] = parse_yandexmaps
