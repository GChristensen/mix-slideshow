import {settings} from "../settings.js";
import {ModelBase} from "./core/model_base.js";

async function saveOptions(e) {
    if (e) {
        e.preventDefault();

        // await settings.folders(document.querySelector("#folders").value);
        // await settings.host(document.querySelector("#host").value);
        // await settings.user(document.querySelector("#user").value);
        // await settings.password(document.querySelector("#password").value);
    }
}

async function restoreOptions() {
    await settings.load();

    // document.querySelector("#folders").value = settings.folders();
    // document.querySelector("#host").value = settings.host();
    // document.querySelector("#user").value = settings.user();
    // document.querySelector("#password").value = settings.password();
}

document.addEventListener("DOMContentLoaded", async () => {
    await restoreOptions();

    $("#clear-album-cache-link").on("click", clearAlbumCache);

    // document.getElementById("folders").addEventListener("blur", (e) => {createMenus(); saveOptions(e);});
    // document.getElementById("host").addEventListener("blur", saveOptions);
    // document.getElementById("user").addEventListener("blur", saveOptions);
    // document.getElementById("password").addEventListener("blur", saveOptions);
});

async function clearAlbumCache(e) {
    e.preventDefault();

    let settings = await browser.storage.local.get();

    if (settings) {
        const keys = Object.keys(settings);
        const entriesToRemove = keys.filter(k => k.startsWith(ModelBase.CACHED_ALBUM_PREFIX));

        return browser.storage.local.remove(entriesToRemove);
    }
}