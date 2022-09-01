from setuptools import setup, find_packages

setup(
    name='slideshow_helper',
    version='0.1',
    packages=['slideshow'],
    url='',
    license='',
    author='gchristnsn',
    author_email='gchristnsn@gmail.com',
    description='',
    install_requires=['Flask'],
    entry_points = {
        'console_scripts': ['slideshow_helper=slideshow.helper:main'],
    }
)
