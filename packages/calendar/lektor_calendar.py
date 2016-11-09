# -*- coding: utf-8 -*-
from lektor.pluginsystem import Plugin


class CalendarPlugin(Plugin):
    name = u'calendar'
    description = u'Add your description here.'

    def on_process_template_context(self, context, **extra):
        def test_function():
            return 'Value from plugin %s' % self.name
        context['test_function'] = test_function
