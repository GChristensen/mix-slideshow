import {PinterestAPI} from "./api_pinterest.js";
import {ModelBase} from "./model_base.js";

export class PinterestModel extends ModelBase {
    static ID = "pinterest-boards";

    #pinterestAPI;

    constructor() {
        super();

        return new PinterestAPI().then(pinterestAPI => {
            this.#pinterestAPI = pinterestAPI;
            return this;
        });
    }

    get authorizationText() {
        return "Authorize";
    }

    get modelID() {
        return PinterestModel.ID;
    }

    get isAuthorized() {
        return this.#pinterestAPI.isAuthorized;
    }

    async authorize() {
        if (!this.#pinterestAPI.isAuthorized)
            await browser.tabs.create({url: "https://pinterest.com", active: true});
    }

    async getAlbums() {
        let result = null;

        if (this.#pinterestAPI.isAuthorized) {
            result = await this.#pinterestAPI.getBoards();

            result = result.map(b => ({
                id: b.id,
                name: b.name,
                modified: new Date(b.board_order_modified_at).getTime()
            }));
        }

        return result;
    }

    async _getAlbumImages(album) {
        let boardPins = await this.#pinterestAPI.getPins(album.id);

        return boardPins.map(pin => ({
            id: pin.id,
            url: pin.images?.orig?.url,
            sourceURL: this.#pinterestAPI.getURL(`/pin/${pin.id}`)
        }));
    }
}