import {PinterestAPI} from "../api_pinterest.js";
import {sleep} from "../utils.js";

export class PinterestModel {
    static ID = "pinterest-boards";

    #pinterestAPI;

    constructor() {
        return new PinterestAPI().then(pinterestAPI => {
            this.#pinterestAPI = pinterestAPI;
            return this;
        });
    }

    get name() {
        return "Pinterest";
    }

    get authorizationURL() {
        return "https://pinterest.com";
    }

    get isAuthorized() {
        return this.#pinterestAPI.isAuthorized;
    }

    async authorize() {
        if (!this.#pinterestAPI.isAuthorized)
            await browser.tabs.create({url: this.authorizationURL, active: true});
    }

    async getAlbums() {
        let result = null;

        if (this.#pinterestAPI.isAuthorized) {
            result = await this.#pinterestAPI.getBoards();
            result = result.map(b => ({id: b.id, name: b.name}));
        }

        return result;
    }

    async getImages(albums) {
        let images = [];

        for (const album of albums) {
            try {
                let boardPins = await this.#pinterestAPI.getPins(album);
                images = [...images, ...boardPins.map(pin => ({
                    url: pin.images?.orig?.url,
                    sourceURL: this.#pinterestAPI.getURL(`/pin/${pin.id}`)
                }))];
            } catch (e) {
                console.error(e);
            }
        }

        return images;
    }
}