from setuptools import setup

setup(
    name="lektor-gulp",
    version="0.1",
    author=u"Sergey Arkhipov",
    author_email="nineseconds@yandex.ru",
    license="MIT",
    py_modules=["lektor_gulp"],
    entry_points={
        "lektor.plugins": [
            "gulp = lektor_gulp:GulpPlugin",
        ]
    }
)
