
function getLatestGHRelease(repo, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var release = JSON.parse(this.responseText);
            callback(release);
        }
    };

    xhr.open("GET", "https://api.github.com/repos/gchristensen/" + repo + "/releases/latest");
    xhr.send();
}

function setDownloadLink(release, elementId, ext) {
    var asset;

    for (var i = 0; i < release.assets.length; ++i)
        if (release.assets[i].name.indexOf(ext) >= 0) {
            asset = release.assets[i];
            break;
        }

    var link = document.getElementById(elementId);
    link.href = asset.browser_download_url;
}