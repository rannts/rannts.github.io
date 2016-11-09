# -*- coding: utf-8 -*-


import collections
import datetime
import posixpath

import bs4
import icalendar
import jinja2
import pytz

from lektor.context import get_ctx
from lektor.pluginsystem import Plugin
from lektor.project import Project
from six.moves.urllib import parse


CALENDAR_DEFAULT_PROPERTIES = {
    "version": "2.0",
    "prodid": "-//rannts.ru//Python Community of Nizhny Novgorod//RU",
    "calscale": "GREGORIAN",
    "description": "Events of Python Community of Nizhny Novgorod",
    "REFRESH-INTERVAL;VALUE=DURATION": "PT12H",
    "method": "publish"
}

NN_TIMEZONE = pytz.timezone("Europe/Moscow")


def make_calendar(pad):
    calendar = icalendar.Calendar()

    for key, value in CALENDAR_DEFAULT_PROPERTIES.items():
        calendar.add(key, value)

    calendar.add("url", pad.make_absolute_url(pad.root.url_path))
    calendar.add("source", pad.make_absolute_url(
        posixpath.join(pad.root.url_path, "events.ics")
    ))

    return calendar


class CalendarPlugin(Plugin):

    name = "calendar"
    description = "Support for ICalendar format"

    def __init__(self, *args, **kwargs):
        super(CalendarPlugin, self).__init__(*args, **kwargs)

        ctx = get_ctx()
        if ctx is not None:
            pad = ctx.pad
        else:
            pad = Project.discover().make_env(False).new_pad()

        self.global_calendar = make_calendar(pad)

    def on_setup_env(self):
        self.env.jinja_env.filters["global_ics_link"] = self.generate_ical_link
        self.env.jinja_env.filters["generate_google_calendar_link"] = \
            self.generate_google_calendar_link

    @jinja2.evalcontextfilter
    def generate_ical_link(self, ctx, value):
        from pdb import set_trace; set_trace()
        return ""

    def generate_google_calendar_link(self, value):
        time_start = value["date"]
        time_finish = max(tlk["date"] for tlk in value.children.all())
        time_finish += datetime.timedelta(hours=1)

        query = {
            "action": "TEMPLATE",
            "dates": "{0}/{1}".format(
                self.google_calendar_date(time_start),
                self.google_calendar_date(time_finish)
            ),
            "text": "{0}{1}".format(
                value.pad.config.values["PROJECT"]["name"],
                value.record_label
            ),
            "location": value["place"] or "",
            "details": value["description"] or ""
        }
        query["details"] = bs4.BeautifulSoup(
            query["details"].html, "html.parser")
        query["details"] = "".join(query["details"].strings)
        query["details"] = query["details"].encode("utf-8")
        query["location"] = query["location"].encode("utf-8")

        query_string = parse.urlencode(query)
        url = "https://calendar.google.com/calendar/render?{}".format(
            query_string
        )

        return url

    def google_calendar_date(self, local_dt):
        local_dt_aware = NN_TIMEZONE.localize(local_dt)
        local_dt_aware = NN_TIMEZONE.normalize(local_dt_aware)
        utc_dt = local_dt_aware.astimezone(pytz.UTC)

        return utc_dt.strftime("%Y%m%dT%H%M00Z")
