from setuptools import setup

setup(
    name='lektor-yandexmaps',
    version='0.1',
    author=u'Sergey Arkhipov',
    author_email='nineseconds@yandex.ru',
    license='MIT',
    py_modules=['lektor_yandexmaps'],
    entry_points={
        'lektor.plugins': [
            'yandexmaps = lektor_yandexmaps:YandexmapsPlugin',
        ]
    }
)
