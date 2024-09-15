#!/usr/bin/env python

from setuptools import setup

setup(
    name='trace_that',
    version='1.0',
    description='tracethat.dev reporter for Python',
    author='Kacper Pietrzak',
    author_email='kacpietrzak@gmail.com',
    url='https://www.python.org/sigs/distutils-sig/',
    packages=['.'],
    install_requires=[
    'typing_extensions>=4.12.2',
    'cryptography>=43.0.1',
    'aiohttp>=3.10.5'
    ],
)
