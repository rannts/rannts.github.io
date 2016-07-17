from setuptools import setup

setup(
    name="lektor-micawber",
    version="0.1",
    author=u"Sergey Arkhipov",
    author_email="nineseconds@yandex.ru",
    license="MIT",
    py_modules=["lektor_micawber"],
    entry_points={
        "lektor.plugins": [
            "micawber = lektor_micawber:MicawberPlugin",
        ]
    },
    install_requires=[
        "micawber>=0.3.3,<0.3.4"
    ]
)
