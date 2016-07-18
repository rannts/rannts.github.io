# -*- coding: utf-8 -*-


from __future__ import unicode_literals

import sys

import bs4
import bs4.element
import jinja2

from lektor.pluginsystem import Plugin


if sys.version_info == 3:
    to_str = str
else:
    to_str = unicode


DEFAULT_LIMIT = float("inf")
"""Default limit of children."""

DEFAULT_TEXT = "Details"
"""Default link name."""


class PostcutPlugin(Plugin):
    name = "postcut"
    description = "Adds a 'cut' link to the post"

    PARSER = "html.parser"

    @property
    def children_limit(self):
        return self.get_config().get_int("limit", DEFAULT_LIMIT)

    @property
    def text(self):
        return self.get_config().get("text", DEFAULT_TEXT)

    @jinja2.evalcontextfilter
    def postcut(self, ctx, value, url):
        soup = self.make_soup(value)
        contents = self.get_contents(soup)

        if len(contents) > self.children_limit:
            contents = contents[:self.children_limit]
            contents.append(self.make_cut(url))

        html = "\n".join(to_str(tag) for tag in contents)
        if ctx.autoescape:
            html = jinja2.Markup(html)

        return html

    def get_contents(self, soup):
        contents = filter(
            lambda tag: isinstance(tag, bs4.element.Tag), soup.children)
        contents = list(contents)

        return contents

    def make_soup(self, html):
        return bs4.BeautifulSoup(html, self.PARSER)

    def make_cut(self, url):
        p_soup = self.make_soup("<p class='news-cut'></p>")
        p_tag = p_soup.p
        link = p_soup.new_tag("a", href=url)
        link.string = self.text
        p_tag.append(link)

        return p_tag

    def on_setup_env(self):
        self.env.jinja_env.filters["postcut"] = self.postcut
