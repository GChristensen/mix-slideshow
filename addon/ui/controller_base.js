import {PinterestModel} from "./model_pinterest.js";
import {settings} from "../settings.js";

export class ControllerBase {
    _sources;

    constructor() {
        this._sources = [PinterestModel.ID];
    }

    async createModel(sourceId) {
        switch (sourceId) {
            case PinterestModel.ID:
                return new PinterestModel();
        }
    }

    #getSelectedAlbumsId(sourceId) {
        return `selected-albums-${sourceId}`;
    }

    async getSelectedAlbums(sourceId) {
        const selectedAlbumsId = this.#getSelectedAlbumsId(sourceId);
        return await settings.get(selectedAlbumsId) || [];
    }

    async setSelectedAlbums(sourceId, albums) {
        const selectedAlbumsId = this.#getSelectedAlbumsId(sourceId);
        return settings.set(selectedAlbumsId, albums);
    }
}