import {ControllerBase} from "./controller_base.js";
import {SlideshowView} from "./view_slideshow.js";
import {shuffle} from "../utils.js";

export class SlideshowController extends ControllerBase {
    onSlideshowFinished;

    #slideshowView = new SlideshowView();
    #slideshowInterval;
    #currentImage;
    #models;
    #images;
    #delay;
    #repeat;
    #paused;
    #queuedAdvance;

    constructor() {
        super();

        this.#slideshowView.onSlideshowClick = this.#onSlideshowClick.bind(this);
        this.#slideshowView.onAdvanceSlideshow = this.#onAdvanceSlideshow.bind(this);
        this.#slideshowView.onTransitionFinished = this.#onTransitionFinished.bind(this);
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

    async startSlideshow(options) {
        this.#slideshowView.displayLoading();
        await this.#collectImages();

        if (this.#images.length) {
            this.#delay = options.delay * 1000;
            this.#repeat = options.repeat;
            this.#paused = false;
            this.#currentImage = -1;

            if (options.shuffle)
                this.#images = shuffle(this.#images);

            this.#slideshowView.prepareSlideshow(options);
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

        if (this.#currentImage >= this.#images.length) {
            if (this.#repeat)
                this.#currentImage = 0;
            else {
                this.stopSlideshow();
                if (this.onSlideshowFinished)
                    this.onSlideshowFinished();
            }
        }

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

    requestFullscreen() {
        this.#slideshowView.requestFullscreen();
    }

    advanceSlideshow(direction) {
        if (this.slideshowRunning) {
            if (this.#slideshowView.inTransition)
                this.#queuedAdvance = direction;
            else {
                this.#queuedAdvance = undefined;

                if (!this.slideshowPaused)
                    this.#resetSlideshowInterval();
                this.#advanceSlideshow(direction);
            }
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

    #onAdvanceSlideshow(direction) {
        this.advanceSlideshow(direction);
    }

    #onTransitionFinished() {
        if (this.#queuedAdvance !== undefined) {
            this.advanceSlideshow(this.#queuedAdvance);
            this.#queuedAdvance = undefined;
        }
    }
}