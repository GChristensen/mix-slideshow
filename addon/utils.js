import {settings} from "./settings.js";

export function merge(to, from) {
    for (const [k, v] of Object.entries(from)) {
        if (!to.hasOwnProperty(k))
            to[k] = v;
    }
    return to;
}

export function showNotification(message) {
    const icon = settings.platform.firefox
        ? browser.runtime.getURL("ui/icons/logo.svg")
        : browser.runtime.getURL("ui/icons/logo128.png");

    browser.notifications.create("cake-notification", {
        "type": "basic",
        "iconUrl": icon,
        "title": "Add Torrent",
        "message": message
    });
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,  ms))
}

export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

export async function sha1(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-1", bytes);

    return hexString(digest);
}

function hexString(buffer) {
    const byteArray = new Uint8Array(buffer);

    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        return hexCode.padStart(2, '0');
    });

    return hexCodes.join('');
}

export async function fetchText(url, init) {
    const response = await fetch(url, init);
    if (response.ok)
        return response.text();
}

export async function fetchJSON(url, init) {
    const response = await fetch(url, init);
    if (response.ok)
        return response.json();
}

export async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);

    return response;
}

export function sortByName(items) {
    const byNameInsensitive = (a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: "base"});
    items.sort(byNameInsensitive);
}
