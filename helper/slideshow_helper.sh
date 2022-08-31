#!/bin/sh
export PYTHONPATH=$(dirname "$0")
python3 -u -c "import slideshow.helper; slideshow.helper.main()"