export class SlideshowView {
    onSlideshowClick;

    #containerId;
    #displayCounter;

    constructor(containerId) {
        this.#containerId = containerId;

        $("#slideshow-container").on("click", this.#onSlideshowClick.bind(this));
    }

    #onSlideshowClick(e) {
        if (this.onSlideshowClick)
            this.onSlideshowClick(e);
    }

    displayLoading() {
        $("#display-slideshow-container").hide();
        $("#loading-slideshow-container").css("display", "flex");
    }

    prepareSlideshow() {
        $("#loading-slideshow-container").hide();
        $("#display-slideshow-container").show();
        $("#slideshow-container").css("cursor", "pointer");

        this.#displayCounter = 0;
    }

    finishSlideshow() {
        $("#display-slideshow-container").hide();
        $("img[id^='slideshow-image']").prop("src", "");
        $("#slideshow-container").css("cursor", "default");
    }

    requestFullscreen() {
        $("#slideshow-container")[0].requestFullscreen();
    }

    async renderImage(imageURL) {
        //this.#renderImagePlain(imageURL);
        return this.#renderImageCrossfading(imageURL);
    }

    #renderImagePlain(imageURL) {
        const image = $(`#slideshow-image-0`);
        image.prop("src", imageURL);
        image.parent().show();
    }

    async #renderImageCrossfading(imageURL) {
        const currentImageId = `#slideshow-image-${this.#displayCounter % 2}`;
        const previousImageId = `#slideshow-image-${(this.#displayCounter + 1) % 2}`;
        const currentImage = $(currentImageId).parent();
        const previousImage = $(previousImageId).parent();

        this.#displayCounter += 1;

        try {
            await this.#loadImage(currentImageId, imageURL);
        } catch (e) {
            console.error(e);
        }

        currentImage.css("z-index", "100");
        previousImage.css("z-index", "99");
        currentImage.fadeIn(1000);
        previousImage.fadeOut(1000);
    }

    async #loadImage(imageId, imageURL) {
        let resolveLoad, rejectLoad;
        const result = new Promise((resolve, reject) => {resolveLoad = resolve; rejectLoad = reject;});
        const image = $(imageId);

        function onImageLoaded(e) {
            image.off("load", onImageLoaded);
            image.off("error", onImageError);
            resolveLoad(e);
        }

        function onImageError(e) {
            image.off("load", onImageLoaded);
            image.off("error", onImageError);
            rejectLoad(e);
        }

        image.on("load", onImageLoaded);
        image.on("error", onImageError);

        image.prop("src", imageURL);

        return result;
    }
}