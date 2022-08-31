import {showNotification} from "./utils.js";

export async function askCSRPermission() {
    if (_MANIFEST_V3)
        return browser.permissions.request({origins: ["<all_urls>"]});

    return true;
}

export async function hasCSRPermission(verbose = true) {
    if (_MANIFEST_V3) {
        const response = await browser.permissions.contains({origins: ["<all_urls>"]});

        if (!response && verbose)
            showNotification("Please, enable optional add-on permissions at the Firefox add-on settings page (about:addons).");

        return response;
    }

    return true;
}
