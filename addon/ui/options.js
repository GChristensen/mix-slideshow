import {settings, SETTINGS_KEY} from "../settings.js";
import {ModelBase} from "./core/model_base.js";
import {showNotification} from "../utils.js";

$(init);

async function init() {
    await settings.load();

    const folders = settings.local_folders();

    if (folders?.length)
        for (const folder of folders)
            addFolder(folder);
    else
        addNewFolder();

    const foldersTable = $("#folders");

    foldersTable.on("click", ".folder-add", e => {
        addNewFolder($(e.target).closest("tr.folder"));
    });

    foldersTable.on("click", ".folder-remove", e => {
        removeLink($(e.target).closest("tr.folder"));
    });

    $("#clear-album-cache-link").on("click", clearAlbumCache);
    $("#export-settings").on("click", exportSettings);
    $("#import-settings").on("click", importSettings);
    $("#import-settings-file-picker").on("change", readSettingsFile);
}

function addFolder(options, sibling) {
    const folderTable = $("#folders");

    let folderTemplate = $("#folder-row-template").prop("content");
    const folderTR = $("tr.folder", folderTemplate).clone();

    if (sibling)
        sibling.after(folderTR);
    else
        folderTR.appendTo(folderTable);

    $(".album-id", folderTR).val(options.id || "");
    $(".title-text", folderTR).val(options.name || "");
    $(".path-text", folderTR).val(options.path || "");
    $(".recursive-check", folderTR).prop("checked", options.recursive);

    $(".title-text", folderTR).on("blur", saveOptions);
    $(".path-text", folderTR).on("blur", saveOptions);
    $(".recursive-check", folderTR).on("change", saveOptions);
}

function addNewFolder(sibling) {
    const newFolder = {id: crypto.randomUUID(), recursive: true};

    if (sibling)
        addFolder(newFolder, sibling);
    else
        addFolder(newFolder);
}

function removeLink(object) {
    const title = $(".title-text", object).val();
    const path = $(".path-text", object).val();
    if (!(title || path) || confirm(`Do you really want to remove ${title? `"${title}"`: "this item"}?`)) {
        object.remove();
        saveOptions();

        if (!$("tr.folder").length)
            addNewFolder();
    }
}

async function saveOptions(e) {
    if (e)
        e.preventDefault();

    await settings.load();

    let folders = $("tr.folder").map(getFolderOptions);
    folders = Array.from(folders).filter(l => !!l);
    await settings.local_folders(folders);
}

function getFolderOptions(i, folderTR) {
    folderTR = $(folderTR);

    const folder = {
        id: $(".album-id", folderTR).val(),
        name: $(".title-text", folderTR).val(),
        path: $(".path-text", folderTR).val(),
        recursive: $(".recursive-check", folderTR).is(":checked")
    };

    if (folder.name && folder.path)
        return folder;
}

async function clearAlbumCache(e) {
    e.preventDefault();

    let settings = await browser.storage.local.get();

    if (settings) {
        const keys = Object.keys(settings);
        const entriesToRemove = keys.filter(k => k.startsWith(ModelBase.CACHED_ALBUM_PREFIX));

        return browser.storage.local.remove(entriesToRemove);
    }
}

const EXPORT_ADDOON_ID = "MixSlideshow";

async function exportSettings(e) {
    e.preventDefault();

    let exported = {};
    exported.addon = EXPORT_ADDOON_ID;
    exported.version = browser.runtime.getManifest().version;

    exported.settings = await settings.get(SETTINGS_KEY) || {};

    // download link
    let file = new Blob([JSON.stringify(exported, null, 2)], {type: "application/json"});
    let url = URL.createObjectURL(file);
    let filename = `${EXPORT_ADDOON_ID}-settings.json`;

    let download = await browser.downloads.download({url: url, filename: filename, saveAs: true});

    let download_listener = delta => {
        if (delta.id === download && delta.state && delta.state.current === "complete") {
            browser.downloads.onChanged.removeListener(download_listener);
            URL.revokeObjectURL(url);
        }
    };
    browser.downloads.onChanged.addListener(download_listener);
}

async function importSettings(e) {
    e.preventDefault();

    $("#import-settings-file-picker").click();
}

async function readSettingsFile(e) {
    let reader = new FileReader();
    reader.onload = async function(re) {
        let imported = JSON.parse(re.target.result);

        if (imported.addon !== EXPORT_ADDOON_ID) {
            showNotification("Export format is not supported.");
            return;
        }

        await settings.set(SETTINGS_KEY, imported.settings);

        chrome.runtime.reload();
    };
    reader.readAsText(e.target.files[0]);
}