function openSlideshow() {
    browser.tabs.create({
        "url": `/ui/slideshow.html`, "active": true
    });
}

const action = _MANIFEST_V3
    ? browser.action
    : browser.browserAction;

action.onClicked.addListener(openSlideshow);
