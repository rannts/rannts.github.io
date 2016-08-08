# -*- coding: utf-8 -*-


import jinja2
import six.moves.urllib.parse as parse

from lektor.pluginsystem import Plugin


EMBEDDED_CODE = (
    '<script type="text/javascript" charset="utf-8" '
    'async src="{url}"></script>'
).strip()
"""Base for the embedded HTML code."""

URL_BASE = "https://api-maps.yandex.ru/services/constructor/1.0/js/"
"""Base URL to for embedded code API."""

URL_PARTS = {
    "sid": "",
    "width": "",
    "height": "",
    "lang": "",
    "sourceType": "",
    "scroll": ""
}
"""Base URL parts to constuct query string."""

DEFAULT_URL_PART_WIDTH = "100%"
"""Default width of the widget."""

DEFAULT_URL_PART_HEIGHT = "500"
"""Default height of the widget."""

DEFAULT_URL_PART_LANG = "ru_RU"
"""Default lang code of the widget."""

DEFAULT_URL_PART_SCROLL = "true"
"""Default scroll possibility of the widget."""


class YandexmapsPlugin(Plugin):
    name = "lektor-yandexmaps"
    description = "Parses a link on YandexMaps constructor and creates embed"

    @property
    def width(self):
        return self.get_config().get("width", DEFAULT_URL_PART_WIDTH)

    @property
    def height(self):
        return self.get_config().get("height", DEFAULT_URL_PART_HEIGHT)

    @property
    def lang(self):
        return self.get_config().get("lang", DEFAULT_URL_PART_LANG)

    @property
    def scroll(self):
        return self.get_config().get("scroll", DEFAULT_URL_PART_SCROLL)

    @jinja2.evalcontextfilter
    def make_code(self, ctx, value):
        url = parse.urlsplit(value)
        query = parse.parse_qs(url.query)
        identifier = query["um"][-1].split(":")[-1]

        code = self.build_code(identifier, "constructor")
        if ctx.autoescape:
            code = jinja2.Markup(code)

        return code

    def build_code(self, identifier, source_type):
        url_parts = URL_PARTS.copy()
        url_parts.update(
            sid=identifier,
            sourceType=source_type,
            width=self.width,
            height=self.height,
            lang=self.lang,
            scroll=self.scroll
        )
        query_string = parse.urlencode(url_parts)
        script_url = "{0}?{1}".format(URL_BASE, query_string)
        code = EMBEDDED_CODE.format(url=script_url)

        return code

    def on_setup_env(self, **extra):
        self.env.jinja_env.filters["yandexmaps"] = self.make_code
