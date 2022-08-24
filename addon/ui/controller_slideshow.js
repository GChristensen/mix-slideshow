import {ControllerBase} from "./controller_base.js";
import {SlideshowView} from "./view_slideshow.js";
import {shuffle} from "../utils.js";

export class SlideshowController extends ControllerBase {
    #slideshowView = new SlideshowView("#slideshow-container");
    #slideshowInterval;
    #currentImage;
    #models;
    #images;
    #delay;
    #paused;

    constructor() {
        super();

        this.#slideshowView.onSlideshowClick = this.#onSlideshowClick.bind(this);
    }

    get slideshowRunning() {
        return !!this.#images;
    }

    get slideshowPaused() {
        return !!this.#paused;
    }

    async #collectImages() {
        if (!this.#models)
            await this.#createModels();

        this.#images = [];

        for (const [sourceId, model] of Object.entries(this.#models)) {
            const selectedAlbums = await this.getSelectedAlbums(sourceId);
            this.#images = [...this.#images, ...await model.getImages(selectedAlbums)];
        }
    }

    async #createModels() {
        this.#models = [];

        for (const source of this._sources)
            this.#models[source] = await this.createModel(source);
    }

    async startSlideshow(delay) {
        this.#slideshowView.displayLoading();
        await this.#collectImages();

        if (this.#images.length) {
            this.#delay = delay;
            this.#paused = false;
            this.#currentImage = -1;
            this.#images = shuffle(this.#images);

            this.#slideshowView.prepareSlideshow();
            this.#resetSlideshowInterval();
            this.#advanceSlideshow();
        }
        else
            this.#images = undefined;
    }

    #resetSlideshowInterval() {
        if (this.#slideshowInterval)
            clearInterval(this.#slideshowInterval);

        this.#slideshowInterval = setInterval(this.#advanceSlideshow.bind(this), this.#delay);
    }

    #advanceSlideshow(direction = true) {
        this.#currentImage += direction? 1: -1;

        if (this.#currentImage >= this.#images.length)
            this.#currentImage = 0;

        if (this.#currentImage < 0)
            this.#currentImage = this.#images.length - 1;

        const imageURL = this.#images[this.#currentImage].url;
        this.#slideshowView.renderImage(imageURL);
    }

    pauseSlideshow() {
        clearInterval(this.#slideshowInterval);
        this.#paused = true;
    }

    resumeSlideshow() {
        this.#advanceSlideshow();
        this.#resetSlideshowInterval();
        this.#paused = false;
    }

    stopSlideshow() {
        clearInterval(this.#slideshowInterval);
        this.#slideshowView.finishSlideshow();
        this.#images = undefined;
        this.#paused = false;
    }

    toggleFullscreen() {
        this.#slideshowView.requestFullscreen();
    }

    advanceSlideshow(direction) {
        if (this.slideshowRunning) {
            this.#advanceSlideshow(direction);
            if (!this.slideshowPaused)
                this.#resetSlideshowInterval();
        }
    }

    showNextImage() {
        this.advanceSlideshow(true);
    }

    showPreviousImage() {
        this.advanceSlideshow(false);
    }

    #onSlideshowClick() {
        if (this.slideshowRunning) {
            const image = this.#images[this.#currentImage];
            browser.tabs.create({url: image.sourceURL, active: true});
        }
    }
}