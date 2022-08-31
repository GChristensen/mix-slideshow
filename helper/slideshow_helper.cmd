@echo off
set PYTHONPATH=%~dp0
python -u -c "import slideshow.helper; slideshow.helper.main()"