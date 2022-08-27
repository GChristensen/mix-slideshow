import {ControllerBase} from "./controller_base.js";
import {AlbumSelectView} from "./view_album_select.js";
import {showNotification} from "../utils.js";

export class AlbumSelectController extends ControllerBase {
    #albumSelectView = new AlbumSelectView();
    #sourceId;
    #model;

    constructor() {
        super();

        this.#albumSelectView.onSourceChanged = this.#onSourceChanged.bind(this);
        this.#albumSelectView.onAlbumSelected = this.#onAlbumSelected.bind(this);
        this.#albumSelectView.onSourceAuthorization = this.#onSourceAuthorization.bind(this);
        this.#albumSelectView.displayLoading();
    }

    async listAlbums() {
        const sourceId = this.#albumSelectView.getSelectedSource();

        this.#albumSelectView.displayLoading();

        if (this.#sourceId !== sourceId) {
            this.#sourceId = sourceId

            try {
                this.#model = await this.createModel(this.#sourceId);
            } catch (e) {
                showNotification("Error accessing resource.");
                throw e;
            }
        }

        if (this.#model.isAuthorized) {
            let sourceAlbums;

            try {
                sourceAlbums = await this.#model.getAlbums() || [];
            } catch (e) {
                showNotification("Error obtaining album list.");
                throw e;
            }

            const selectedAlbums = await this.getSelectedAlbums(sourceId);

            this.#albumSelectView.renderAlbums(sourceAlbums, selectedAlbums);
        }
        else
            this.#albumSelectView.renderAuthorizationLink(this.#model.name, "#");
    }

    async #onSourceChanged() {
        return this.listAlbums();
    }

    async #onAlbumSelected(selectedAlbums) {
        return this.setSelectedAlbums(this.#sourceId, selectedAlbums);
    }

    async #onSourceAuthorization() {
        await this.#model.authorize();
        return this.listAlbums();
    }
}