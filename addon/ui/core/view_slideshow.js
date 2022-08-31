
const NAVIGATION_FADE_MS = 500;
const CROSSFADE_DURATION_MS = 1000;
const NAVIGATION_TIMEOUT_MS = 2000;

export class SlideshowView {
    onSlideshowClick;
    onAdvanceSlideshow;
    onTransitionFinished;

    #displayCounter;
    #slideshowRunning;
    #navigationDisplayed;
    #navigationTimeout;
    #options;
    #inTransition;

    constructor() {
        const container = $("#slideshow-container");
        const leftNavigationButton = $("#left-navigation-button");
        const rightNavigationButton = $("#right-navigation-button");

        container.on("click", this.#onSlideshowClick.bind(this));
        container.on("mousemove", this.#onSlideshowMouseMove.bind(this));

        leftNavigationButton.on("click", e => this.#onAdvanceSlideshow(e, false));
        rightNavigationButton.on("click", e => this.#onAdvanceSlideshow(e, true));
        leftNavigationButton.on("mousemove", e => e.stopPropagation());
        rightNavigationButton.on("mousemove", e => e.stopPropagation());
        leftNavigationButton.on("mouseenter", this.#onNavigationMouseEnter.bind(this));
        rightNavigationButton.on("mouseenter", this.#onNavigationMouseEnter.bind(this));
    }

    get inTransition() {
        return this.#inTransition;
    }

    #onSlideshowClick(e) {
        if (this.onSlideshowClick)
            this.onSlideshowClick(e);
    }

    #onSlideshowMouseMove(e) {
        if (this.#slideshowRunning && !this.#navigationDisplayed) {
            this.#navigationDisplayed = true;
            $("#left-navigation-button").fadeIn(NAVIGATION_FADE_MS);
            $("#right-navigation-button").fadeIn(NAVIGATION_FADE_MS);

            this.#navigationTimeout = setTimeout(this.#hideNavigation.bind(this), NAVIGATION_TIMEOUT_MS);
        }
        else if (this.#navigationDisplayed) {
            clearTimeout(this.#navigationTimeout);
            this.#navigationTimeout = setTimeout(this.#hideNavigation.bind(this), NAVIGATION_TIMEOUT_MS);
        }
    }

    #onNavigationMouseEnter() {
        clearTimeout(this.#navigationTimeout);
    }

    #onAdvanceSlideshow(e, direction) {
        e.stopPropagation();
        this.onAdvanceSlideshow(direction);
    }

    #hideNavigation() {
        this.#navigationDisplayed = false;
        $("#left-navigation-button").fadeOut(NAVIGATION_FADE_MS);
        $("#right-navigation-button").fadeOut(NAVIGATION_FADE_MS);
    }

    displayLoading() {
        $("#display-slideshow-container").hide();
        $("#loading-slideshow-container").css("display", "flex");
    }

    prepareSlideshow(options) {
        this.#options = options;
        this.#displayCounter = 0;
        this.#slideshowRunning = true;

        const objectFit = options.stretch? "contain": "scale-down";
        $("img[id^='slideshow-image']").css("object-fit", objectFit);

        $("#loading-slideshow-container").hide();
        $("#display-slideshow-container").show();
        $("#slideshow-container").css("cursor", "pointer");
    }

    finishSlideshow() {
        this.#slideshowRunning = false;

        $("#display-slideshow-container").hide();
        $("#slideshow-image-container").hide();
        $("img[id^='slideshow-image']").prop("src", "");
        $("#slideshow-container").css("cursor", "default");
    }

    requestFullscreen() {
        $("#slideshow-container")[0].requestFullscreen();
    }

    async renderImage(image) {
        if (this.#options.crossfade)
            return this.#renderImageCrossfading(image);
        else
            return this.#renderImagePlain(image);
    }

    #renderImagePlain(imageURL) {
        const image = $(`#slideshow-image-0`);
        image.prop("title", image.sourceURL);
        image.prop("src", image.url);
        image.parent().show();
    }

    async #renderImageCrossfading(image) {
        const currentImageId = `#slideshow-image-${this.#displayCounter % 2}`;
        const previousImageId = `#slideshow-image-${(this.#displayCounter + 1) % 2}`;
        const currentImage = $(currentImageId).parent();
        const previousImage = $(previousImageId).parent();

        this.#displayCounter += 1;

        try {
            await this.#loadImage(currentImageId, image.url);
        } catch (e) {
            console.error(e);
        }

        this.#inTransition = true;
        currentImage.css("z-index", "100");
        previousImage.css("z-index", "99");
        currentImage.prop("title", image.sourceURL);

        previousImage.fadeOut(CROSSFADE_DURATION_MS);
        currentImage.fadeIn(CROSSFADE_DURATION_MS, () => {
            this.#inTransition = false;
            if (this.onTransitionFinished)
                this.onTransitionFinished();
        });
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