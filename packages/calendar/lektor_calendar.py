# -*- coding: utf-8 -*-


import collections
import datetime
import os.path
import posixpath

import bs4
import icalendar
import jinja2
import pytz
import mistune
from six.moves.urllib import parse

from lektor.build_programs import BuildProgram
from lektor.context import get_ctx
from lektor.pluginsystem import Plugin
from lektor.sourceobj import VirtualSourceObject
from lektor.utils import build_url


CALENDAR_DEFAULT_PROPERTIES = {
    "version": "2.0",
    "prodid": "-//rannts.ru//Python Community of Nizhny Novgorod//RU",
    "calscale": "GREGORIAN",
    "description": "Events of Python Community of Nizhny Novgorod",
    "REFRESH-INTERVAL;VALUE=DURATION": "PT12H",
    "X-PUBLISHED-TTL": "PT12H",
    "method": "publish"
}

NN_TIMEZONE = pytz.timezone("Europe/Moscow")


def generate_google_calendar_link(value):
    query = {
        "action": "TEMPLATE",
        "dates": "{0}/{1}".format(
            make_calendar_date(value["date"]),
            make_calendar_date(get_event_finish(value))
        ),
        "text": "{0}{1}".format(
            value.pad.config.values["PROJECT"]["name"],
            value.record_label
        ),
        "location": value["place"] or "",
        "details": make_calendar_description(value)
    }
    query["details"] = query["details"].encode("utf-8")
    query["location"] = query["location"].encode("utf-8")

    query_string = parse.urlencode(query)
    url = "https://calendar.google.com/calendar/render?{}".format(query_string)

    return url


def get_event_finish(model):
    time_finish = max(tlk["date"] for tlk in model.children.all())
    time_finish += datetime.timedelta(hours=1)

    return time_finish


def make_calendar_date(local_dt):
    local_dt_aware = NN_TIMEZONE.localize(local_dt)
    local_dt_aware = NN_TIMEZONE.normalize(local_dt_aware)
    utc_dt = local_dt_aware.astimezone(pytz.UTC)

    return utc_dt.strftime("%Y%m%dT%H%M00Z")


def make_calendar_description(model):
    model = mistune.markdown(model["description"].source)
    model = bs4.BeautifulSoup(model, "html.parser")
    model = "".join(model.strings)

    return model


class CalendarSource(VirtualSourceObject):

    @property
    def path(self):
        return self.record.path + "@events"

    @property
    def source_content(self):
        with open(self.record.source_filename) as sfp:
            return sfp.read().decode("utf-8")

    @property
    def url_path(self):
        return build_url([self.record.url_path, "events.ics"])


class CalendarBuildProgram(BuildProgram):

    def produce_artifacts(self):
        self.declare_artifact(
            self.source.url_path,
            sources=list(self.source.iter_source_filenames()))

    def build_artifact(self, artifact):
        build_state = artifact.build_state
        calendar = self.make_calendar(build_state.pad)

        meetups = build_state.pad.get("/meetups").children.order_by("-date")
        for model in meetups:
            self.add_to_calendar(calendar, model)

        with artifact.open("wb") as afp:
            afp.write(calendar.to_ical())

    def make_calendar(self, pad):
        calendar = icalendar.Calendar()

        for key, value in CALENDAR_DEFAULT_PROPERTIES.items():
            calendar.add(key, value)

        calendar.add("url", pad.make_absolute_url(pad.root.url_path))
        calendar.add("source", pad.make_absolute_url(
            posixpath.join(pad.root.url_path, "events.ics")
        ))

        return calendar

    def add_to_calendar(self, calendar, model):
        event = icalendar.Event()

        event["uid"] = model.record_label
        event["dtstart"] = make_calendar_date(model["date"])
        event["dtend"] = make_calendar_date(get_event_finish(model))
        event["description"] = make_calendar_description(model)
        event["last-modified"] = make_calendar_date(datetime.datetime.now())
        event["location"] = model["place"] or ""
        event["summary"] = "{0}{1}".format(
            model.pad.config.values["PROJECT"]["name"],
            model.record_label
        )
        event["url"] = model.pad.make_absolute_url(model.url_path)

        calendar.add_component(event)


class CalendarPlugin(Plugin):

    name = "calendar"
    description = "Support for ICalendar format"

    def on_setup_env(self):
        self.env.add_build_program(CalendarSource, CalendarBuildProgram)

        @self.env.virtualpathresolver("events")
        def events_path_resolver(record, pieces):
            if not pieces:
                return CalendarSource(record)

        @self.env.generator
        def generate_feeds(source):
            if source is not source.pad.root:
                return

            yield CalendarSource(source)

        self.env.jinja_env.filters["generate_google_calendar_link"] = \
            generate_google_calendar_link
