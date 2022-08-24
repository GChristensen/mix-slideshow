import {ControllerBase} from "./controller_base.js";
import {AlbumSelectView} from "./view_album_select.js";

export class AlbumSelectController extends ControllerBase {
    #albumSelectView = new AlbumSelectView();

    constructor() {
        super();

        this.#albumSelectView.onAlbumSelected = this.#onAlbumSelected.bind(this);
        this.#albumSelectView.displayLoading();
    }

    async listAlbums() {
        const sourceId = this.getSelectedSource();
        const model = await this.createModel(sourceId);
        const sourceAlbums = await model.getAlbums() || [];
        const selectedAlbums = await this.getSelectedAlbums(sourceId);

        this.#albumSelectView.render(sourceAlbums, selectedAlbums);
    }

    async #onAlbumSelected(selectedAlbums) {
        const sourceId = this.getSelectedSource();
        this.setSelectedAlbums(sourceId, selectedAlbums);
    }

    getSelectedSource() {
        const sourceSelect = $("#source");
        return sourceSelect.val();
    }
}