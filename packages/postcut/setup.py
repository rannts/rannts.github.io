from setuptools import setup

setup(
    name="lektor-postcut",
    version="0.1",
    author=u"Sergey Arkhipov",
    author_email="nineseconds@yandex.ru",
    license="MIT",
    py_modules=["lektor_postcut"],
    entry_points={
        "lektor.plugins": [
            "postcut = lektor_postcut:PostcutPlugin",
        ]
    },
    install_requires=[
        "beautifulsoup4",
        "html5lib==0.9999999"
    ]
)
