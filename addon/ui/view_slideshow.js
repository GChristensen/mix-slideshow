export class SlideshowView {
    onSlideshowClick;
    #containerId;

    constructor(containerId) {
        this.#containerId = containerId;

        $("#slideshow-container").on("click", this.#onSlideshowClick.bind(this));
    }

    #onSlideshowClick(e) {
        if (this.onSlideshowClick)
            this.onSlideshowClick(e);
    }

    renderImage(imageURL) {
        $(`${this.#containerId} #slideshow-image`).prop("src", imageURL);
    }

    displayLoading() {
        $("#slideshow-image").hide();
        $("#loading-slideshow").show();
    }

    prepareSlideshow() {
        $("#loading-slideshow").hide();
        $("#slideshow-image").show();
        $("#slideshow-container").css("cursor", "pointer");
    }

    finishSlideshow() {
        $("#slideshow-image").hide();
        $("#slideshow-image").prop("src", "");
        $("#slideshow-container").css("cursor", "default");
    }

    requestFullscreen() {
        $("#slideshow-container")[0].requestFullscreen();
    }
}