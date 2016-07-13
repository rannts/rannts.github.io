from setuptools import setup

setup(
    name='lektor-oembed',
    version='0.1',
    author=u'Sergey Arkhipov',
    author_email='nineseconds@yandex.ru',
    license='MIT',
    py_modules=['lektor_oembed'],
    entry_points={
        'lektor.plugins': [
            'oembed = lektor_oembed:OembedPlugin',
        ]
    }
)
