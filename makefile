test:
	cd addon; start web-ext run -p "${HOME}/../firefox/debug" --keep-profile-changes

test-nightly:
	cd addon; start web-ext run -p "$(HOME)/../firefox/debug.nightly" --firefox=nightly --keep-profile-changes

sign:
	cd addon; web-ext sign -a ../build -i .web-extension-id `cat $(HOME)/.amo/creds`

build:
	cd addon; web-ext build -a ../build -i .web-extension-id

.PHONY: helper-clean
helper-clean:
	cd helper; rm -r -f build
	cd helper; rm -r -f dist
	cd helper; rm -f *.spec

.PHONY: helper-win
helper-win:
	make helper-clean
	cd helper; rm -f *.exe
	cd helper; rm -f *.zip
	cd helper; pyinstaller slideshow_helper.py
	cd helper; makensis setup.nsi
	make helper-clean

.PHONY: helper-cli
helper-cli:
	cd helper; cp -r ./slideshow ./cli-installer/slideshow_helper/
	cd helper; cp -r ./manifests ./cli-installer/slideshow_helper/
	cd helper; rm -r -f ./cli-installer/slideshow_helper/manifests/debug_manifest*
	cd helper; cp -r ./setup.py ./cli-installer/slideshow_helper/
	cd helper; rm -f slideshow-helper.tgz
	cd helper; 7za.exe a -ttar -so -an ./cli-installer/* -xr!__pycache__ | 7za.exe a -si slideshow-helper.tgz
	cd helper; rm ./cli-installer/slideshow_helper/setup.py
	cd helper; rm -r -f ./cli-installer/slideshow_helper/slideshow
	cd helper; rm -r -f ./cli-installer/slideshow_helper/manifests
