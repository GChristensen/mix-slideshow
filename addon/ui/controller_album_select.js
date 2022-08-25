import {ControllerBase} from "./controller_base.js";
import {AlbumSelectView} from "./view_album_select.js";

export class AlbumSelectController extends ControllerBase {
    #albumSelectView = new AlbumSelectView();
    #sourceId;
    #model;

    constructor() {
        super();

        this.#albumSelectView.onAlbumSelected = this.#onAlbumSelected.bind(this);
        this.#albumSelectView.onSourceAuthorization = this.#onSourceAuthorization.bind(this);
        this.#albumSelectView.displayLoading();
    }

    async listAlbums() {
        const sourceId = this.#albumSelectView.getSelectedSource();

        if (this.#sourceId !== sourceId) {
            this.#sourceId = sourceId
            this.#model = await this.createModel(this.#sourceId);
        }

        if (this.#model.isAuthorized) {
            const sourceAlbums = await this.#model.getAlbums() || [];
            const selectedAlbums = await this.getSelectedAlbums(sourceId);

            this.#albumSelectView.renderAlbums(sourceAlbums, selectedAlbums);
        }
        else
            this.#albumSelectView.renderAuthorizationLink(this.#model.name, "#");
    }

    async #onAlbumSelected(selectedAlbums) {
        return this.setSelectedAlbums(this.#sourceId, selectedAlbums);
    }

    async #onSourceAuthorization() {
        await this.#model.authorize();
        return this.listAlbums();
    }
}