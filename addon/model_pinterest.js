import {PinterestAPI} from "./api_pinterest.js";

export class PinterestModel {
    #pinterestAPI;

    constructor() {
        return new PinterestAPI().then(pinterestAPI => {
            this.#pinterestAPI = pinterestAPI;
            return this;
        });
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