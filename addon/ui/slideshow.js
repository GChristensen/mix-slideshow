import {settings} from "../settings.js";
import {AlbumSelectController} from "./controller_album_select.js";
import {SlideshowController} from "./controller_slideshow.js";

const albumSelectController = new AlbumSelectController();
const slideshowController = new SlideshowController();

$(init);

async function init() {
    await settings.load();

    $("#button-start").on("click", startSlideshow);
    $("#button-stop").on("click", stopSlideshow);
    $("#button-fullscreen").on("click", toggleFullscreen);

    document.addEventListener('keydown', onKeyDown, false);

    albumSelectController.listAlbums();
}

async function startSlideshow() {
    if (slideshowController.slideshowRunning) {
        if (slideshowController.slideshowPaused) {
            $("#icon-start").prop("src", "icons/pause.svg");
            slideshowController.resumeSlideshow();
        }
        else {
            $("#icon-start").prop("src", "icons/play.svg");
            slideshowController.pauseSlideshow();
        }
    }
    else {
        $("#icon-start").prop("src", "icons/pause.svg");
        await slideshowController.startSlideshow(5000);
    }
}

function stopSlideshow() {
    $("#icon-start").prop("src", "icons/play.svg");
    slideshowController.stopSlideshow();
}

function toggleFullscreen() {
    slideshowController.toggleFullscreen();
}

function onKeyDown(event) {
    const keyCode = event.code;

    switch(keyCode) {
        case "ArrowRight":
        case "Space":
            slideshowController.showNextImage();
            break;

        case "ArrowLeft":
            slideshowController.showPreviousImage();
            break;

        case "Escape":
            stopSlideshow();
            break;
    }
}