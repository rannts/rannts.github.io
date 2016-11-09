from setuptools import setup

setup(
    name="lektor-calendar",
    version="0.1",
    author=u"Sergey Arkhipov",
    author_email="nineseconds@yandex.ru",
    license="MIT",
    py_modules=["lektor_calendar"],
    entry_points={
        "lektor.plugins": [
            "calendar = lektor_calendar:CalendarPlugin",
        ]
    },
    install_requires=[
        "icalendar>=3,<4",
        "beautifulsoup4",
        "six"
    ]
)
