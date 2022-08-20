test:
	cd addon; start web-ext run -p "${HOME}/../firefox/debug" --keep-profile-changes

test-nightly:
	cd addon; start web-ext run -p "$(HOME)/../firefox/debug.nightly" --firefox=nightly --keep-profile-changes

sign:
	cd addon; web-ext sign -a ../build -i .web-extension-id `cat $(HOME)/.amo/creds`

build:
	cd addon; web-ext build -a ../build -i .web-extension-id

