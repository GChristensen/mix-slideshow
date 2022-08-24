import {settings} from "../settings.js";
import {AlbumSelectController} from "./controller_album_select.js";
import {SlideshowController} from "./controller_slideshow.js";
import {OptionsDialog} from "./dialog_options.js";

const albumSelectController = new AlbumSelectController();
const slideshowController = new SlideshowController();
const optionsDialog = new OptionsDialog();

$(init);

async function init() {
    await settings.load();

    $("#button-start").on("click", startSlideshow);
    $("#button-stop").on("click", stopSlideshow);
    $("#button-options").on("click", showOptions);
    $("#button-fullscreen").on("click", requestFullscreen);

    document.addEventListener('keydown', onKeyDown, false);

    albumSelectController.listAlbums();
    slideshowController.onSlideshowFinished = onSlideshowFinished;
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

        const options = {
            delay: settings.delay(),
            shuffle: settings.shuffle(),
            repeat: settings.repeat(),
            stretch: settings.stretch(),
            crossfade: settings.crossfade()
        };

        await slideshowController.startSlideshow(options);
    }
}

function stopSlideshow() {
    slideshowController.stopSlideshow();
    onSlideshowFinished();
}

function onSlideshowFinished() {
    $("#icon-start").prop("src", "icons/play.svg");
}

function requestFullscreen() {
    slideshowController.requestFullscreen();
}

function showOptions() {
    optionsDialog.show();
}

async function onKeyDown(event) {
    const keyCode = event.code;

    switch(keyCode) {
        case "Space":
            await startSlideshow();
            break;

        case "Escape":
            stopSlideshow();
            break;

        case "ArrowRight":
            slideshowController.showNextImage();
            break;

        case "ArrowLeft":
            slideshowController.showPreviousImage();
            break;

        case "ArrowUp":
            requestFullscreen();
            break;

        case "ArrowDown":
            if (document.fullscreenElement)
                document.exitFullscreen();
            break;
    }
}