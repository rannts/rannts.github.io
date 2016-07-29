from setuptools import setup

setup(
    name="lektor-typography",
    version="0.1",
    author=u"Sergey Arkhipov",
    author_email="nineseconds@yandex.ru",
    license="MIT",
    py_modules=["lektor_typography"],
    entry_points={
        "lektor.plugins": [
            "typography = lektor_typography:TypograhyPlugin",
        ]
    },
    install_requires=[
        "chakert>=0.2,<0.3",
        "six",
        "lxml"
    ]
)
